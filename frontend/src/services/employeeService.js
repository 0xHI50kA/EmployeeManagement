
const API_URL = "http://localhost:8080/api/employees";

// Retrieve all employees
export async function getEmployees() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to retrieve employees.");
  }

  return response.json();
}

// Create an employee
export async function createEmployee(employee) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    throw new Error("Failed to create employee.");
  }

  return response.json();
}

// Retrieve one employee
export async function getEmployeeById(id) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to retrieve employee.");
  }

  return response.json();
}

// Update an employee
export async function updateEmployee(id, employee) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    throw new Error("Failed to update employee.");
  }

  return response.json();
}

// Delete an employee
export async function deleteEmployee(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete employee.");
  }
}
