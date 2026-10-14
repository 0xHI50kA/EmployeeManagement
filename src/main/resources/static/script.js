const API_URL = "http://localhost:8080/api/employees";

const tableBody = document.getElementById("employeeTableBody");
const totalEmployees = document.getElementById("totalEmployees");
const totalDepartments = document.getElementById("totalDepartments");
const connectionStatus = document.getElementById("connectionStatus");
const recordCount = document.getElementById("recordCount");
const searchInput = document.getElementById("searchInput");
const messageBox = document.getElementById("message");
const dialog = document.getElementById("employeeDialog");
const employeeForm = document.getElementById("employeeForm");

let employees = [];
let messageTimer;

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatSalary(salary) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(Number(salary) || 0);
}

function showMessage(text, isError = false) {
    clearTimeout(messageTimer);
    messageBox.textContent = text;
    messageBox.classList.remove("hidden", "error");

    if (isError) {
        messageBox.classList.add("error");
    }

    messageTimer = setTimeout(() => {
        messageBox.classList.add("hidden");
    }, 4000);
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.error || data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}

async function loadEmployees() {
    connectionStatus.textContent = "Checking";
    tableBody.innerHTML = `
        <tr><td colspan="6" class="empty-state">Loading employees...</td></tr>
    `;

    try {
        const result = await apiRequest(API_URL);
        employees = Array.isArray(result) ? result : [];
        connectionStatus.textContent = "Connected";
        document.querySelector(".status-dot").style.background = "#239b72";
        renderEmployees();
    } catch (error) {
        employees = [];
        connectionStatus.textContent = "Offline";
        document.querySelector(".status-dot").style.background = "#dc5555";

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Could not load employees. Make sure your Java API is running
                    on port 8080, then click Refresh.
                </td>
            </tr>
        `;

        updateStats();
        console.error("Failed to load employees:", error);
        showMessage("Could not connect to the employee API.", true);
    }
}

function renderEmployees() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = employees.filter(employee => [
        employee.name,
        employee.email,
        employee.department,
        employee.position,
        employee.id
    ].some(value => String(value ?? "").toLowerCase().includes(query)));

    updateStats();

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    ${employees.length
                        ? "No matching employees found."
                        : "No employees yet. Click Add Employee to create a record."}
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = filtered.map(employee => `
            <tr>
                <td>#${escapeHtml(employee.id)}</td>
                <td>
                    <span class="employee-name">${escapeHtml(employee.name)}</span>
                    <span class="employee-email">${escapeHtml(employee.email)}</span>
                </td>
                <td>
                    <span class="department-tag">
                        ${escapeHtml(employee.department)}
                    </span>
                </td>
                <td>${escapeHtml(employee.position)}</td>
                <td class="salary">${escapeHtml(formatSalary(employee.salary))}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button"
                            data-action="edit" data-id="${escapeHtml(employee.id)}">
                            Edit
                        </button>
                        <button class="action-button delete"
                            data-action="delete" data-id="${escapeHtml(employee.id)}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    recordCount.textContent =
        `Showing ${filtered.length} of ${employees.length} employees`;
}

function updateStats() {
    totalEmployees.textContent = employees.length;

    const departments = new Set(
        employees.map(employee => employee.department?.trim())
            .filter(Boolean)
            .map(department => department.toLowerCase())
    );

    totalDepartments.textContent = departments.size;
}

function openAddDialog() {
    employeeForm.reset();
    document.getElementById("employeeId").value = "";
    document.getElementById("dialogTitle").textContent = "Add Employee";
    document.getElementById("saveBtn").textContent = "Save Employee";
    dialog.showModal();
}

function openEditDialog(employee) {
    employeeForm.reset();

    document.getElementById("employeeId").value = employee.id;
    document.getElementById("name").value = employee.name ?? "";
    document.getElementById("email").value = employee.email ?? "";
    document.getElementById("department").value = employee.department ?? "";
    document.getElementById("position").value = employee.position ?? "";
    document.getElementById("salary").value = employee.salary ?? 0;

    document.getElementById("dialogTitle").textContent = "Edit Employee";
    document.getElementById("saveBtn").textContent = "Update Employee";
    dialog.showModal();
}

document.getElementById("addEmployeeBtn")
    .addEventListener("click", openAddDialog);

document.getElementById("closeDialogBtn")
    .addEventListener("click", () => dialog.close());

document.getElementById("cancelBtn")
    .addEventListener("click", () => dialog.close());

document.getElementById("refreshBtn")
    .addEventListener("click", loadEmployees);

searchInput.addEventListener("input", renderEmployees);

tableBody.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const employee = employees.find(item => String(item.id) === id);

    if (button.dataset.action === "edit" && employee) {
        openEditDialog(employee);
        return;
    }

    if (button.dataset.action === "delete" && employee) {
        const confirmed = confirm(
            `Delete employee "${employee.name}"? This cannot be undone.`
        );

        if (!confirmed) return;

        button.disabled = true;

        try {
            await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, {
                method: "DELETE"
            });

            showMessage("Employee deleted successfully.");
            await loadEmployees();
        } catch (error) {
            showMessage(error.message || "Failed to delete employee.", true);
        } finally {
            button.disabled = false;
        }
    }
});

employeeForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!employeeForm.reportValidity()) return;

    const id = document.getElementById("employeeId").value;

    const employee = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        position: document.getElementById("position").value.trim(),
        salary: Number(document.getElementById("salary").value)
    };

    if (
        !employee.name || !employee.email ||
        !employee.department || !employee.position ||
        !Number.isFinite(employee.salary) || employee.salary < 0
    ) {
        showMessage("Please enter valid employee information.", true);
        return;
    }

    const saveButton = document.getElementById("saveBtn");
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        await apiRequest(
            id ? `${API_URL}/${encodeURIComponent(id)}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(employee)
            }
        );

        dialog.close();
        showMessage(id
            ? "Employee updated successfully."
            : "Employee added successfully.");

        await loadEmployees();
    } catch (error) {
        showMessage(
            error.message || "Unable to save employee. Check the API.",
            true
        );
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = id ? "Update Employee" : "Save Employee";
    }
});

loadEmployees();