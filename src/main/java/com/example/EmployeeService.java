package com.example;

import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.List;

public class EmployeeService {

    // CREATE: Add a new employee
    public Employee createEmployee(Employee employee) {
        Transaction transaction = null;

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            session.persist(employee);

            transaction.commit();
            return employee;

        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            throw new RuntimeException("Failed to create employee", e);
        }
    }

    // READ: Get all employees
    public List<Employee> getAllEmployees() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM Employee ORDER BY id", Employee.class
            ).getResultList();
        }
    }

    // READ: Get one employee by ID
    public Employee getEmployeeById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Employee.class, id);
        }
    }

    // UPDATE: Update an existing employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Transaction transaction = null;

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Employee employee = session.get(Employee.class, id);

            if (employee == null) {
                transaction.rollback();
                return null;
            }

            employee.setName(updatedEmployee.getName());
            employee.setEmail(updatedEmployee.getEmail());
            employee.setDepartment(updatedEmployee.getDepartment());
            employee.setPosition(updatedEmployee.getPosition());
            employee.setSalary(updatedEmployee.getSalary());

            transaction.commit();
            return employee;

        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            throw new RuntimeException("Failed to update employee", e);
        }
    }

    // DELETE: Delete an employee by ID
    public boolean deleteEmployee(Long id) {
        Transaction transaction = null;

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Employee employee = session.get(Employee.class, id);

            if (employee == null) {
                transaction.rollback();
                return false;
            }

            session.remove(employee);

            transaction.commit();
            return true;

        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            throw new RuntimeException("Failed to delete employee", e);
        }
    }
}