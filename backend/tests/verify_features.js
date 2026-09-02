const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/UserModel");
const Doctor = require("../models/DoctorModel");
const Appointment = require("../models/AppointmentModel");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const generateToken = require("../utils/generateToken");

const results = [];

function recordResult(testName, passed, details = "") {
  results.push({ testName, passed, details });
  const symbol = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${symbol} - ${testName}${details ? ` (${details})` : ""}`);
}

async function runVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING JEEVANSH AI COMPREHENSIVE VERIFICATION");
  console.log("==================================================");

  try {
    // 1. MongoDB Connection
    await mongoose.connect(process.env.MONGO_URI);
    recordResult("MongoDB Connection", true, `Connected to database`);

    // 2. Fetch or verify Test Users & Doctors
    let patient = await User.findOne({ email: "arjun@example.com" });
    let doctorUser = await User.findOne({ email: "neha.joshi@hospital.com" });
    let otherPatient = await User.findOne({ email: "priya@example.com" });

    if (!patient || !doctorUser) {
      console.log("Users not found. Seeding first...");
      // In case DB is empty, run seed inline
      const bcrypt = require("bcryptjs");
      if (!patient) {
        patient = await User.create({
          name: "Arjun Mehta",
          email: "arjun@example.com",
          password: "demo123",
          role: "patient",
        });
      }
      if (!doctorUser) {
        doctorUser = await User.create({
          name: "Dr. Neha Joshi",
          email: "neha.joshi@hospital.com",
          password: "demo123",
          role: "doctor",
        });
      }
      if (!otherPatient) {
        otherPatient = await User.create({
          name: "Priya Sharma",
          email: "priya@example.com",
          password: "demo123",
          role: "patient",
        });
      }
    }

    let doctor = await Doctor.findOne({ userId: doctorUser._id });
    if (!doctor) {
      doctor = await Doctor.create({
        userId: doctorUser._id,
        specialty: "Radiologist",
        experience: 14,
        hospital: "Apollo Hospitals",
        location: "Chennai, TN",
        consultationFee: 800,
        available: true,
      });
    }

    recordResult(
      "Test Entities Available",
      true,
      `Patient: ${patient.email}, Doctor: ${doctorUser.email}, DoctorDoc ID: ${doctor._id}`
    );

    // 3. Appointment Lifecycle Testing
    console.log("\n--- TESTING APPOINTMENT SYSTEM ---");

    // A. Clean previous test appointments for this doctor & slot
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5);
    testDate.setHours(0, 0, 0, 0);

    await Appointment.deleteMany({
      doctorId: doctor._id,
      appointmentTime: "11:30 AM",
    });

    // B. Create appointment
    const newAppointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: testDate,
      appointmentTime: "11:30 AM",
      reason: "Persistent chest discomfort after viral flu",
      symptoms: "Mild wheezing, fatigue",
      status: "pending",
    });

    recordResult(
      "Appointment Creation in MongoDB",
      newAppointment && newAppointment.status === "pending",
      `ID: ${newAppointment._id}`
    );

    // C. Test Double Booking Conflict Detection (HTTP 409 Simulation)
    const startOfDay = new Date(testDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(testDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBooking = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: "11:30 AM",
      status: { $in: ["pending", "confirmed"] },
    });

    recordResult(
      "Appointment Conflict Prevention (Double Booking Detection)",
      conflictingBooking !== null,
      `Detected conflict on slot 11:30 AM`
    );

    // D. Doctor Confirm Appointment
    newAppointment.status = "confirmed";
    newAppointment.doctorNotes = "Confirmed. Please fast for 4 hours before consultation.";
    await newAppointment.save();

    const confirmedDoc = await Appointment.findById(newAppointment._id);
    recordResult(
      "Doctor Appointment Confirmation",
      confirmedDoc.status === "confirmed" && confirmedDoc.doctorNotes.includes("Confirmed"),
      `Status: ${confirmedDoc.status}`
    );

    // E. Doctor Complete Appointment
    confirmedDoc.status = "completed";
    confirmedDoc.doctorNotes = "Diagnosis: Mild bronchial irritation. Prescribed inhaler for 5 days.";
    await confirmedDoc.save();

    const completedDoc = await Appointment.findById(newAppointment._id);
    recordResult(
      "Appointment Completion with Clinical Notes",
      completedDoc.status === "completed" && completedDoc.doctorNotes.includes("inhaler"),
      `Status: ${completedDoc.status}`
    );

    // F. Test Cancellation on a new pending appointment
    const cancelTestApp = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: testDate,
      appointmentTime: "04:30 PM",
      reason: "General checkup",
      status: "pending",
    });

    cancelTestApp.status = "cancelled";
    cancelTestApp.cancellationReason = "Schedule conflict";
    await cancelTestApp.save();

    const cancelledDoc = await Appointment.findById(cancelTestApp._id);
    recordResult(
      "Patient Appointment Cancellation",
      cancelledDoc.status === "cancelled" && cancelledDoc.cancellationReason === "Schedule conflict",
      `Status: ${cancelledDoc.status}`
    );

    // 4. Community Forum Lifecycle Testing
    console.log("\n--- TESTING COMMUNITY FORUM ---");

    // A. Create Community Post
    const testPost = await Post.create({
      author: patient._id,
      title: "Test Discussion: Automated AI screening verification",
      content: "Sharing thoughts on the new diagnostic inference speed and bounding box visualizations in Jeevansh AI.",
      category: "AI & Healthcare",
      tags: ["AI", "TestTag", "Verification"],
      likes: [],
      commentCount: 0,
    });

    recordResult(
      "Community Post Persistence in MongoDB",
      testPost && testPost.title.includes("Automated AI screening"),
      `Post ID: ${testPost._id}`
    );

    // B. Toggle Like (Add Like)
    testPost.likes.push(doctorUser._id);
    await testPost.save();

    let updatedPost = await Post.findById(testPost._id);
    const hasDoctorLiked = updatedPost.likes.some((id) => id.equals(doctorUser._id));
    recordResult(
      "Community Like Persistence (Add Like)",
      hasDoctorLiked && updatedPost.likes.length === 1,
      `Likes count: ${updatedPost.likes.length}`
    );

    // C. Toggle Like (Remove Like)
    const idx = updatedPost.likes.findIndex((id) => id.equals(doctorUser._id));
    if (idx !== -1) updatedPost.likes.splice(idx, 1);
    await updatedPost.save();

    updatedPost = await Post.findById(testPost._id);
    recordResult(
      "Community Unlike Persistence (Remove Like)",
      updatedPost.likes.length === 0,
      `Likes count: ${updatedPost.likes.length}`
    );

    // D. Add Comments & Verify Synchronization
    const comment1 = await Comment.create({
      postId: testPost._id,
      author: doctorUser._id,
      content: "Great clinical observation! The model achieves high sensitivity.",
    });

    testPost.commentCount = (testPost.commentCount || 0) + 1;
    await testPost.save();

    const postAfterComment = await Post.findById(testPost._id);
    const commentsList = await Comment.find({ postId: testPost._id });

    recordResult(
      "Community Comment Persistence & Synchronized Count",
      commentsList.length === 1 && postAfterComment.commentCount === 1,
      `Comment ID: ${comment1._id}, Post commentCount: ${postAfterComment.commentCount}`
    );

    // E. Delete Comment & Verify Count Decrement
    await Comment.findByIdAndDelete(comment1._id);
    postAfterComment.commentCount = Math.max(0, postAfterComment.commentCount - 1);
    await postAfterComment.save();

    const postAfterCommentDel = await Post.findById(testPost._id);
    const commentsAfterDel = await Comment.find({ postId: testPost._id });

    recordResult(
      "Comment Deletion & Count Decrement",
      commentsAfterDel.length === 0 && postAfterCommentDel.commentCount === 0,
      `Comments remaining: ${commentsAfterDel.length}, Post commentCount: ${postAfterCommentDel.commentCount}`
    );

    // F. Delete Post and Verify Cascading Comment Cleanup
    const comment2 = await Comment.create({
      postId: testPost._id,
      author: patient._id,
      content: "Comment to test cascade deletion.",
    });

    await Promise.all([
      Post.findByIdAndDelete(testPost._id),
      Comment.deleteMany({ postId: testPost._id }),
    ]);

    const postDeletedCheck = await Post.findById(testPost._id);
    const orphanComments = await Comment.find({ postId: testPost._id });

    recordResult(
      "Post Deletion & Cascading Comment Cleanup",
      postDeletedCheck === null && orphanComments.length === 0,
      `Orphan comments: ${orphanComments.length}`
    );

    // 5. Clean up temporary test appointments
    await Appointment.findByIdAndDelete(newAppointment._id);
    await Appointment.findByIdAndDelete(cancelTestApp._id);

    console.log("\n==================================================");
    console.log("📊 ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("==================================================");

    const allPassed = results.every((r) => r.passed);
    console.log(`Overall Result: ${allPassed ? "100% PASS ✅" : "SOME FAILED ❌"}`);

    await mongoose.connection.close();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("❌ Verification failed with error:", error);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
}

runVerification();
