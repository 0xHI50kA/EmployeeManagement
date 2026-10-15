
import { useEffect, useMemo, useState } from "react";
import { getEmployees } from "./services/employeeService";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not connect to the employee API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return employees.filter((employee) =>
      [
        employee.fullName,
        employee.name,
        employee.email,
        employee.department,
        employee.position,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [employees, search]);

  const departmentCount = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">E</span>
          <span>Employify</span>
        </a>

        <p className="nav-heading">WORKSPACE</p>

        <a className="nav-item active" href="#dashboard">
          <span>▦</span> Dashboard
        </a>

        <a className="nav-item" href="#employees">
          <span>♙</span> Employees
        </a>

        <div className="sidebar-bottom">
          <div className="avatar">RJ</div>
          <div>
            <strong>Administrator</strong>
            <small>Employee Management</small>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Manage your employee information in one place.
            </p>
          </div>

          <button className="refresh-button" onClick={loadEmployees}>
            ↻ Refresh
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon purple">♙</div>
            <p>Total Employees</p>
            <h2>{employees.length}</h2>
            <small>Employee records</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue">▦</div>
            <p>Departments</p>
            <h2>{departmentCount}</h2>
            <small>Unique departments</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>API Status</p>
            <h2 className="status-online">Connected</h2>
            <small>Java backend response received</small>
          </article>
        </section>

        <section className="employee-section" id="employees">
          <div className="section-header">
            <div>
              <h2>Employee Directory</h2>
              <p>Browse and search employee records.</p>
            </div>

            <span className="record-count">
              {filteredEmployees.length} records
            </span>
          </div>

          <div className="search-wrapper">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search name, email, or department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search employees"
            />
          </div>

          {loading ? (
            <div className="message">Loading employee records...</div>
          ) : error ? (
            <div className="message error">
              <p>{error}</p>
              <button onClick={loadEmployees}>Try again</button>
            </div>
          ) : (


        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>POSITION</th>
                <th>SALARY</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => {
                const employeeName = employee.fullName || employee.name || "";

                return (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>

                    <td>
                      <div className="employee-name">
                        <div>
                          <strong>{employeeName}</strong>
                          <small>{employee.email || "No email"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="department-tag">
                        {employee.department || "Unassigned"}
                      </span>
                    </td>

                    <td>{employee.position || "—"}</td>

                    <td>
                      {employee.salary != null
                        ? Number(employee.salary).toLocaleString("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="message">
              {search
                ? "No employees match your search."
                : "No employee records found."}
            </div>
          )}
        </div>


          )}
        </section>

        <footer className="footer">
          Employify · Employee Management System
          <span>Java · Hibernate · MySQL · React</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
