let students = [];
let editingIndex = -1;

// Load students from localStorage on page load
document.addEventListener("DOMContentLoaded", function () {
  loadStudentsFromStorage();
  displayStudents();
  updateRecordsCount();
});

// Navigation functionality
function showSection(section) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.classList.remove("active");
  });

  // Remove active class from all tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected section
  document.getElementById(section + "-section").classList.add("active");
  event.target.classList.add("active");

  // Refresh records if viewing records section
  if (section === "records") {
    displayStudents();
    updateRecordsCount();
    checkScrollbar();
  }
}

// Form validation functions
function validateName(name) {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name.trim()) && name.trim().length > 0;
}

function validateStudentId(id) {
  const idRegex = /^\d+$/;
  return idRegex.test(id.trim()) && id.trim().length > 0;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validateContactNumber(contact) {
  const contactRegex = /^\d{10}$/;
  return contactRegex.test(contact.trim());
}

function validateForm(form) {
  let isValid = true;
  const formData = new FormData(form);

  // Get field names based on form type
  const isEditForm = form.id === "editForm";
  const nameField = isEditForm ? "editStudentName" : "studentName";
  const idField = isEditForm ? "editStudentId" : "studentId";
  const emailField = isEditForm ? "editEmail" : "email";
  const contactField = isEditForm ? "editContactNumber" : "contactNumber";

  const name = formData.get(nameField);
  const studentId = formData.get(idField);
  const email = formData.get(emailField);
  const contactNumber = formData.get(contactField);

  // Reset error states
  form.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error");
  });

  // Validate each field
  if (!validateName(name)) {
    showFieldError(form.querySelector(`[name="${nameField}"]`));
    isValid = false;
  }

  if (!validateStudentId(studentId)) {
    showFieldError(form.querySelector(`[name="${idField}"]`));
    isValid = false;
  } else {
    // Check for duplicate student ID (only for new registrations or different ID during edit)
    const existingStudent = students.find(
      (student, index) =>
        student.studentId === studentId.trim() &&
        (isEditForm ? index !== editingIndex : true)
    );
    if (existingStudent) {
      showFieldError(form.querySelector(`[name="${idField}"]`));
      form
        .querySelector(`[name="${idField}"]`)
        .parentElement.querySelector(".error-message").textContent =
        "Student ID already exists";
      isValid = false;
    }
  }

  if (!validateEmail(email)) {
    showFieldError(form.querySelector(`[name="${emailField}"]`));
    isValid = false;
  }

  if (!validateContactNumber(contactNumber)) {
    showFieldError(form.querySelector(`[name="${contactField}"]`));
    isValid = false;
  }

  return isValid;
}

function showFieldError(field) {
  field.parentElement.classList.add("error");
}

// Form submission handling
document.getElementById("studentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validateForm(this)) {
    const formData = new FormData(this);
    const student = {
      name: formData.get("studentName").trim(),
      studentId: formData.get("studentId").trim(),
      email: formData.get("email").trim(),
      contactNumber: formData.get("contactNumber").trim(),
      registeredAt: new Date().toLocaleDateString(),
    };

    students.push(student);
    saveStudentsToStorage();
    resetForm();

    // Show success message
    showNotification("Student registered successfully!", "success");

    // Switch to records view
    setTimeout(() => {
      showSection("records");
      document
        .querySelector("[onclick=\"showSection('records')\"]")
        .classList.add("active");
      document
        .querySelector("[onclick=\"showSection('register')\"]")
        .classList.remove("active");
    }, 1000);
  }
});

// Edit form submission
document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validateForm(this)) {
    const formData = new FormData(this);
    const updatedStudent = {
      name: formData.get("editStudentName").trim(),
      studentId: formData.get("editStudentId").trim(),
      email: formData.get("editEmail").trim(),
      contactNumber: formData.get("editContactNumber").trim(),
      registeredAt: students[editingIndex].registeredAt,
    };

    students[editingIndex] = updatedStudent;
    saveStudentsToStorage();
    closeEditModal();
    displayStudents();
    showNotification("Student updated successfully!", "success");
  }
});

function resetForm() {
  document.getElementById("studentForm").reset();
  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error");
  });
}

// Display students in table
function displayStudents(studentsToShow = students) {
  const tbody = document.getElementById("recordsBody");

  if (studentsToShow.length === 0) {
    tbody.innerHTML =
      '<tr class="no-records"><td colspan="5">No student records found.</td></tr>';
    return;
  }

  tbody.innerHTML = studentsToShow
    .map(
      (student, index) => `
                <tr>
                    <td><strong>${student.name}</strong></td>
                    <td>${student.studentId}</td>
                    <td>${student.email}</td>
                    <td>${student.contactNumber}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-small btn-edit" onclick="editStudent(${students.indexOf(
                              student
                            )})">Edit</button>
                            <button class="btn-small btn-delete" onclick="deleteStudent(${students.indexOf(
                              student
                            )})">Delete</button>
                        </div>
                    </td>
                </tr>
            `
    )
    .join("");

  checkScrollbar();
}

// Edit student functionality
function editStudent(index) {
  editingIndex = index;
  const student = students[index];

  document.getElementById("editStudentName").value = student.name;
  document.getElementById("editStudentId").value = student.studentId;
  document.getElementById("editEmail").value = student.email;
  document.getElementById("editContactNumber").value = student.contactNumber;

  document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  document.getElementById("editForm").reset();
  document.querySelectorAll("#editForm .form-group").forEach((group) => {
    group.classList.remove("error");
  });
  editingIndex = -1;
}

// Delete student functionality
function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student record?")) {
    students.splice(index, 1);
    saveStudentsToStorage();
    displayStudents();
    updateRecordsCount();
    showNotification("Student deleted successfully!", "success");
  }
}

// Search functionality
document.getElementById("searchBox").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm) ||
      student.studentId.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      student.contactNumber.includes(searchTerm)
  );
  displayStudents(filteredStudents);
});

// localStorage functions
function saveStudentsToStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

function loadStudentsFromStorage() {
  const storedStudents = localStorage.getItem("students");
  if (storedStudents) {
    students = JSON.parse(storedStudents);
  }
}

function updateRecordsCount() {
  document.getElementById(
    "recordsCount"
  ).textContent = `Total: ${students.length}`;
}

// Dynamic scrollbar functionality
function checkScrollbar() {
  const tableContainer = document.getElementById("tableContainer");
  const table = document.querySelector(".records-table");

  if (table.scrollHeight > tableContainer.clientHeight) {
    tableContainer.style.overflowY = "auto";
    tableContainer.style.maxHeight = "400px";
  } else {
    tableContainer.style.overflowY = "visible";
    tableContainer.style.maxHeight = "none";
  }
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background: ${type === "success" ? "#28a745" : "#dc3545"};
                color: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 2000;
                animation: slideIn 0.3s ease;
                font-weight: 500;
            `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
            }
        `;
document.head.appendChild(style);

// Close modal when clicking outside
document.getElementById("editModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeEditModal();
  }
});

// Window resize handler for scrollbar
window.addEventListener("resize", checkScrollbar);
