package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

public class EmployeeApiServer {

    private static final EmployeeService employeeService = new EmployeeService();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(
                new InetSocketAddress("localhost", 8080), 0
        );

        server.createContext("/api/employees", EmployeeApiServer::handleEmployees);
        server.setExecutor(null);
        server.start();

        System.out.println("Employee API is running!");
        System.out.println("Open http://localhost:8080/api/employees");
    }

    private static void handleEmployees(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Origin", "*"
        );
        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        );
        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Headers", "Content-Type"
        );

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("/api/employees".equals(path)) {
                handleEmployeeCollection(exchange, method);
                return;
            }

            if (path.matches("/api/employees/\\d+")) {
                long id = Long.parseLong(path.substring(
                        "/api/employees/".length()
                ));
                handleSingleEmployee(exchange, method, id);
                return;
            }

            sendJson(exchange, 404, Map.of("error", "Endpoint not found"));

        } catch (IllegalArgumentException e) {
            sendJson(exchange, 400, Map.of("error", "Invalid request data"));
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(exchange, 500, Map.of("error", "Internal server error"));
        } finally {
            exchange.close();
        }
    }

    private static void handleEmployeeCollection(
            HttpExchange exchange, String method
    ) throws IOException {

        switch (method) {
            case "GET" -> {
                List<Employee> employees = employeeService.getAllEmployees();
                sendJson(exchange, 200, employees);
            }
            case "POST" -> {
                Employee employee = readEmployee(exchange);
                Employee saved = employeeService.createEmployee(employee);
                sendJson(exchange, 201, saved);
            }
            default -> sendJson(
                    exchange, 405, Map.of("error", "Method not allowed")
            );
        }
    }

    private static void handleSingleEmployee(
            HttpExchange exchange, String method, long id
    ) throws IOException {

        switch (method) {
            case "GET" -> {
                Employee employee = employeeService.getEmployeeById(id);

                if (employee == null) {
                    sendJson(exchange, 404, Map.of("error", "Employee not found"));
                } else {
                    sendJson(exchange, 200, employee);
                }
            }
            case "PUT" -> {
                Employee updated = readEmployee(exchange);
                Employee result = employeeService.updateEmployee(id, updated);

                if (result == null) {
                    sendJson(exchange, 404, Map.of("error", "Employee not found"));
                } else {
                    sendJson(exchange, 200, result);
                }
            }
            case "DELETE" -> {
                boolean deleted = employeeService.deleteEmployee(id);

                if (deleted) {
                    sendJson(exchange, 200, Map.of("message", "Employee deleted"));
                } else {
                    sendJson(exchange, 404, Map.of("error", "Employee not found"));
                }
            }
            default -> sendJson(
                    exchange, 405, Map.of("error", "Method not allowed")
            );
        }
    }

    private static Employee readEmployee(HttpExchange exchange) throws IOException {
        try (InputStream input = exchange.getRequestBody()) {
            Employee employee = objectMapper.readValue(input, Employee.class);

            if (employee.getName() == null || employee.getName().isBlank()
                    || employee.getEmail() == null || employee.getEmail().isBlank()
                    || employee.getDepartment() == null || employee.getDepartment().isBlank()
                    || employee.getPosition() == null || employee.getPosition().isBlank()
                    || !Double.isFinite(employee.getSalary())
                    || employee.getSalary() < 0) {
                throw new IllegalArgumentException("Invalid employee fields");
            }

            return employee;
        }
    }

    private static void sendJson(
            HttpExchange exchange, int status, Object data
    ) throws IOException {

        byte[] response = objectMapper.writeValueAsBytes(data);

        exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
        );
        exchange.sendResponseHeaders(status, response.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(response);
        }
    }
}