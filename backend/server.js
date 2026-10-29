const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("Student Management API is running");
});

// Get All Students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// Get Single Student
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

// Create Student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({ message: error.message });
  }
});

// Update Student
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({ message: error.message });
  }
});

// Delete Student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid student ID" });
  }
});

// Safe Dynamic Theme API Route
app.get('/api/theme', async (req, res) => {
  try {
    // Check if Mongoose connection is ready
    if (mongoose.connection.readyState !== 1) {
      return res.json({ theme: 'orange' });
    }

    // Access raw collection safely via mongoose
    const setting = await mongoose.connection.db.collection('settings').findOne({});
    
    if (setting && setting.theme) {
      return res.json({ theme: setting.theme });
    }

    return res.json({ theme: 'orange' });
  } catch (error) {
    console.error('Theme API error:', error);
    return res.json({ theme: 'orange' });
  }
});

// Database Connection & Server Listener
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });