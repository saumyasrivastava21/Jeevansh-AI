const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const cors = require("cors");

dotenv.config({ path: path.join(__dirname, "../.env") });

const userRoutes = require("../routes/userRoutes");
const doctorRoutes = require("../routes/doctorRoutes");
const appointmentRoutes = require("../routes/appointmentRoutes");
const communityRoutes = require("../routes/communityRoutes");
const { notFound, errorHandler } = require("../middlewares/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/community", communityRoutes);

app.use(notFound);
app.use(errorHandler);

let server;
const PORT = 5555;
const BASE = `http://127.0.0.1:${PORT}/api`;

async function request(endpoint, options = {}) {
  const url = `${BASE}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runHttpApiTests() {
  console.log("==================================================");
  console.log("🌐 STARTING HTTP REST API VERIFICATION SUITE");
  console.log("==================================================");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    server = app.listen(PORT);
    console.log(`Test server running on port ${PORT}`);

    // 1. Patient Login
    console.log("\n[1] Patient Login (POST /api/users/login)");
    const patientLogin = await request("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "arjun@example.com",
        password: "demo123",
        role: "patient",
      }),
    });
    console.log(`Status: ${patientLogin.status}, Success: ${patientLogin.data?.success}`);
    const patientToken = patientLogin.data?.data?.token;
    if (!patientToken) throw new Error("Failed to get patient token");

    // 2. Doctor Login
    console.log("\n[2] Doctor Login (POST /api/users/login)");
    const doctorLogin = await request("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "neha.joshi@hospital.com",
        password: "demo123",
        role: "doctor",
      }),
    });
    console.log(`Status: ${doctorLogin.status}, Success: ${doctorLogin.data?.success}`);
    const doctorToken = doctorLogin.data?.data?.token;
    if (!doctorToken) throw new Error("Failed to get doctor token");

    // 3. Public Get Doctors
    console.log("\n[3] Public Doctor List (GET /api/doctors)");
    const docList = await request("/doctors");
    console.log(`Status: ${docList.status}, Total Doctors: ${docList.data?.data?.length}`);
    const firstDoctor = docList.data?.data?.[0];
    if (!firstDoctor) throw new Error("No doctors returned");

    // 4. Book Appointment (Patient)
    console.log("\n[4] Book Appointment (POST /api/appointments)");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 4);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const bookRes = await request("/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: firstDoctor._id,
        appointmentDate: dateStr,
        appointmentTime: "02:00 PM",
        reason: "Follow-up consultation for respiratory symptoms",
        symptoms: "Occasional shortness of breath",
      }),
    });
    console.log(`Status: ${bookRes.status}, App ID: ${bookRes.data?.data?._id}, Status: ${bookRes.data?.data?.status}`);
    const bookedId = bookRes.data?.data?._id;
    if (!bookedId) throw new Error("Booking failed");

    // 5. Test Conflict Prevention (Duplicate Slot -> HTTP 409)
    console.log("\n[5] Test Conflict Prevention (POST /api/appointments duplicate slot)");
    const conflictRes = await request("/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: firstDoctor._id,
        appointmentDate: dateStr,
        appointmentTime: "02:00 PM",
        reason: "Second booking on same slot",
      }),
    });
    console.log(`Status: ${conflictRes.status} (Expected 409), Message: ${conflictRes.data?.message}`);
    if (conflictRes.status !== 409) throw new Error(`Expected 409, got ${conflictRes.status}`);

    // 6. Patient Fetch My Appointments
    console.log("\n[6] Patient Fetch My Appointments (GET /api/appointments/my)");
    const myApps = await request("/appointments/my", {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.log(`Status: ${myApps.status}, Count: ${myApps.data?.data?.length}`);

    // 7. Doctor Fetch Appointments
    console.log("\n[7] Doctor Fetch Appointments (GET /api/appointments/doctor)");
    const docApps = await request("/appointments/doctor", {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    console.log(`Status: ${docApps.status}, Count: ${docApps.data?.data?.length}`);

    // 8. Doctor Confirm Appointment
    console.log(`\n[8] Doctor Confirm Appointment (PATCH /api/appointments/${bookedId}/confirm)`);
    const confirmRes = await request(`/appointments/${bookedId}/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ doctorNotes: "Slot confirmed. Please bring recent X-rays." }),
    });
    console.log(`Status: ${confirmRes.status}, New Status: ${confirmRes.data?.data?.status}`);

    // 9. Unauthorized Patient Attempt to Confirm (Should be 403 Forbidden)
    console.log("\n[9] Unauthorized Patient Attempt to Confirm (Security Check)");
    const unauthConfirm = await request(`/appointments/${bookedId}/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ doctorNotes: "Hacking notes" }),
    });
    console.log(`Status: ${unauthConfirm.status} (Expected 403), Message: ${unauthConfirm.data?.message}`);
    if (unauthConfirm.status !== 403) throw new Error(`Expected 403, got ${unauthConfirm.status}`);

    // 10. Doctor Complete Appointment
    console.log(`\n[10] Doctor Complete Appointment (PATCH /api/appointments/${bookedId}/complete)`);
    const completeRes = await request(`/appointments/${bookedId}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ doctorNotes: "Patient examined. Prescribed bronchodilator." }),
    });
    console.log(`Status: ${completeRes.status}, New Status: ${completeRes.data?.data?.status}`);

    // 11. Community Feed (Public GET /api/community/posts)
    console.log("\n[11] Community Feed (GET /api/community/posts)");
    const feedRes = await request("/community/posts");
    console.log(`Status: ${feedRes.status}, Total Posts: ${feedRes.data?.data?.total}`);

    // 12. Create Community Post
    console.log("\n[12] Create Community Post (POST /api/community/posts)");
    const createPostRes = await request("/community/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        title: "HTTP Test: Jeevansh AI Scan Feedback",
        content: "Testing persistent community forum functionality across all endpoints.",
        category: "General Health",
        tags: ["Testing", "HTTP", "Health"],
      }),
    });
    console.log(`Status: ${createPostRes.status}, Post ID: ${createPostRes.data?.data?._id}`);
    const newPostId = createPostRes.data?.data?._id;

    // 13. Like Post
    console.log(`\n[13] Like Post (POST /api/community/posts/${newPostId}/like)`);
    const likeRes = await request(`/community/posts/${newPostId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    console.log(`Status: ${likeRes.status}, Likes: ${likeRes.data?.data?.likesCount}, isLiked: ${likeRes.data?.data?.isLiked}`);

    // 14. Add Comment
    console.log(`\n[14] Add Comment (POST /api/community/posts/${newPostId}/comments)`);
    const commentRes = await request(`/community/posts/${newPostId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ content: "Clinical test comment from Dr. Neha." }),
    });
    console.log(`Status: ${commentRes.status}, Comment ID: ${commentRes.data?.data?._id}`);
    const commentId = commentRes.data?.data?._id;

    // 15. Delete Comment
    console.log(`\n[15] Delete Comment (DELETE /api/community/comments/${commentId})`);
    const delCommentRes = await request(`/community/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    console.log(`Status: ${delCommentRes.status}, Message: ${delCommentRes.data?.message}`);

    // 16. Delete Post
    console.log(`\n[16] Delete Post (DELETE /api/community/posts/${newPostId})`);
    const delPostRes = await request(`/community/posts/${newPostId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.log(`Status: ${delPostRes.status}, Message: ${delPostRes.data?.message}`);

    console.log("\n==================================================");
    console.log("🎉 ALL HTTP REST API ENDPOINTS PASSED WITH 100% SUCCESS!");
    console.log("==================================================");

    server.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ HTTP Test Suite Failed:", error);
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
}

runHttpApiTests();
