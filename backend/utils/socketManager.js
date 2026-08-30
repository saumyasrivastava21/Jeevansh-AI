const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Doctor = require("../models/DoctorModel");

// Map<userId, Set<socketId>> — supports multi-tab presence
const activeUserSockets = new Map();
// Map<userId, { name, specialty }> — quick lookup for online doctor info
const onlineDoctorInfo = new Map();

let ioInstance = null;

/**
 * Initialize Socket.io with JWT auth and presence tracking.
 */
function initializeSocket(io) {
  ioInstance = io;

  // JWT authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key_123"
      );
      const user = await User.findById(decoded._id || decoded.id).select(
        "-password"
      );
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    // --- Track socket in per-user Set ---
    if (!activeUserSockets.has(userId)) {
      activeUserSockets.set(userId, new Set());
    }
    activeUserSockets.get(userId).add(socket.id);

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);

    // --- Doctor online presence ---
    if (userRole === "doctor") {
      // Only broadcast if this is the first tab (newly online)
      if (activeUserSockets.get(userId).size === 1) {
        try {
          const doctorProfile = await Doctor.findOne({ userId });
          const info = {
            userId,
            name: socket.userName,
            specialty: doctorProfile?.specialty || "General",
          };
          onlineDoctorInfo.set(userId, info);
          io.emit("doctor:online", info);
        } catch (err) {
          console.error("Error fetching doctor profile for presence:", err);
        }
      }
    }

    // --- Join / leave post comment rooms ---
    socket.on("join:post", (postId) => {
      socket.join(`post:${postId}`);
    });

    socket.on("leave:post", (postId) => {
      socket.leave(`post:${postId}`);
    });

    // --- Disconnect ---
    socket.on("disconnect", () => {
      const sockets = activeUserSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeUserSockets.delete(userId);

          // If doctor, broadcast offline only when all tabs closed
          if (userRole === "doctor") {
            onlineDoctorInfo.delete(userId);
            io.emit("doctor:offline", { userId });
          }
        }
      }
    });
  });
}

/**
 * Get the Socket.io server instance.
 */
function getIO() {
  return ioInstance;
}

/**
 * Get list of currently online doctors.
 */
function getOnlineDoctors() {
  return Array.from(onlineDoctorInfo.values());
}

/**
 * Check if a specific user is currently online.
 */
function isUserOnline(userId) {
  const sockets = activeUserSockets.get(userId.toString());
  return sockets && sockets.size > 0;
}

module.exports = { initializeSocket, getIO, getOnlineDoctors, isUserOnline };
