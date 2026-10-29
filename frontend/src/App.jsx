import React, { useEffect } from 'react';
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/students`;

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  department: "",
  semester: "",
  contact: "",
};

function App() {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch('https://studentmanagementsystem-96qk.onrender.com/api/theme');
        const data = await response.json();
        if (data.theme) {
          document.documentElement.style.setProperty('--primary-color', data.theme);
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };

    fetchTheme();
  }, []);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load student records.");
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to connect to backend. Check that port 5000 is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.studentId.trim() ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.semester ||
      !form.contact.trim()
    ) {
      setError("Please fill in all six fields.");
      return;
    }

    setSaving(true);

    const payload = {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      semester: Number(form.semester),
      contact: form.contact.trim(),
    };

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to save student.");
      }

      setMessage(
        editingId
          ? "Student updated successfully."
          : "Student added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student) {
  const id = student._id || student.id;

  if (!id) {
    setError("This student record has no usable ID.");
    return;
  }

  setForm({
    studentId: student.studentId || "",
    name: student.name || "",
    email: student.email || "",
    department: student.department || "",
    semester: student.semester ?? "",
    contact: student.contact || "",
  });

  setEditingId(id);
  setMessage("");
  setError("");

  document.querySelector(".form-panel")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

  async function handleDelete(student) {
    const id = student._id || student.id;

    if (!id) {
      setError("This student record has no usable ID.");
      return;
    }

    if (!window.confirm(`Delete the record for ${student.name}?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete student.");
      }

      setMessage("Student deleted successfully.");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadStudents();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  const filteredStudents = students.filter((student) =>
    [
      student.studentId,
      student.name,
      student.email,
      student.department,
      student.semester,
      student.contact,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">S</span>
          StudentSphere
        </a>
        <span className="topbar-label">Student Management System</span>
      </header>

      <main className="container" id="home">
        <section className="hero">
          <span className="eyebrow">STUDENT INFORMATION PORTAL</span>
          <h1>Manage your students.</h1>
          <p>Add, search, update and manage student records in one place.</p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-label">Total Students</span>
            <strong>{students.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Matching Records</span>
            <strong>{filteredStudents.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">System Status</span>
            <strong className="status-text">
              {loading
                ? "Loading..."
                : error && students.length === 0
                  ? "Check API"
                  : "Ready"}
            </strong>
          </div>
        </section>

        {message && (
          <div className="alert success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">
                  {editingId ? "EDIT RECORD" : "NEW RECORD"}
                </span>
                <h2>{editingId ? "Update student" : "Add a student"}</h2>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="studentId">Student ID *</label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="e.g. STU001"
                value={form.studentId}
                onChange={handleChange}
                required
              />

              <label htmlFor="name">Full name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter student name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="department">Department *</label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={handleChange}
                required
              />

              <label htmlFor="semester">Semester *</label>
              <input
                id="semester"
                name="semester"
                type="number"
                min="1"
                max="12"
                placeholder="Enter semester"
                value={form.semester}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact">Contact number *</label>
              <input
                id="contact"
                name="contact"
                type="tel"
                placeholder="Enter contact number"
                value={form.contact}
                onChange={handleChange}
                required
              />

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Student"}
              </button>

              {editingId && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>

          <div className="panel records-panel">
            <div className="panel-heading records-heading">
              <div>
                <span className="section-kicker">DATABASE RECORDS</span>
                <h2>Student directory</h2>
              </div>
              <button
                className="refresh-button"
                type="button"
                onClick={loadStudents}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search student records..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search students"
              />
            </div>

            {loading ? (
              <div className="empty-state">Loading student records...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">▤</span>
                <h3>{search ? "No matching students" : "No students yet"}</h3>
                <p>
                  {search
                    ? "Try another search term."
                    : "Add a student using the form to get started."}
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id || student.id}>
                        <td>{student.studentId || "—"}</td>
                        <td>
                          <div className="student-cell">
                            <span className="avatar">
                              {(student.name || "?").charAt(0).toUpperCase()}
                            </span>
                            <div className="student-info">
                              <strong>{student.name}</strong>
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{student.department || "—"}</td>
                        <td>{student.semester ?? "—"}</td>
                        <td>{student.contact || "—"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              type="button"
                              onClick={() => handleEdit(student)}
                              aria-label={`Edit ${student.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              type="button"
                              onClick={() => handleDelete(student)}
                              aria-label={`Delete ${student.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="table-footer">
              Showing {filteredStudents.length} of {students.length} records
            </div>
          </div>
        </section>

        <footer className="footer">
          StudentSphere · Student Information Management System
        </footer>
      </main>
    </div>
  );
}

export default App;
