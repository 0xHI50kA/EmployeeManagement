package com.example;

import java.util.List;

public class EmployeeServiceTest {

    public static void main(String[] args) {
        EmployeeService service = new EmployeeService();

        try {
            // CREATE: Insert a test employee
            Employee employee = new Employee(
                    "Juan Dela Cruz",
                    "juan.delacruz.test@example.com",
                    "IT",
                    "Junior Developer",
                    25000.00
            );

            Employee savedEmployee = service.createEmployee(employee);

            System.out.println("\n=== EMPLOYEE CREATED ===");
            System.out.println("ID: " + savedEmployee.getId());
            System.out.println("Name: " + savedEmployee.getName());
            System.out.println("Email: " + savedEmployee.getEmail());

            // READ: Retrieve all employees
            List<Employee> employees = service.getAllEmployees();

            System.out.println("\n=== ALL EMPLOYEES ===");
            System.out.println("Total employees: " + employees.size());

            for (Employee emp : employees) {
                System.out.println(
                        emp.getId() + " | " +
                        emp.getName() + " | " +
                        emp.getEmail() + " | " +
                        emp.getDepartment()
                );
            }

            System.out.println("\nSUCCESS: CREATE and READ operations work!");

        } catch (Exception e) {
            System.err.println("TEST FAILED:");
            e.printStackTrace();
        } finally {
            HibernateUtil.shutdown();
        }
    }
}