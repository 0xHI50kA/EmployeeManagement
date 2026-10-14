package com.example;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import java.util.Properties;

public class HibernateUtil {

    private static final SessionFactory SESSION_FACTORY =
            buildSessionFactory();

    private static SessionFactory buildSessionFactory() {

        Properties settings = new Properties();

        settings.put(
            "hibernate.connection.driver_class",
            "com.mysql.cj.jdbc.Driver"
        );

        settings.put(
            "hibernate.connection.url",
            "jdbc:mysql://localhost:3306/employee_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
        );

        settings.put("hibernate.connection.username", "root");
        settings.put("hibernate.connection.password", "");

        settings.put(
            "hibernate.dialect",
            "org.hibernate.dialect.MySQLDialect"
        );

        // Create or update mapped tables automatically.
        settings.put("hibernate.hbm2ddl.auto", "update");

        settings.put("hibernate.show_sql", "true");
        settings.put("hibernate.format_sql", "true");

        return new Configuration()
                .setProperties(settings)
                .addAnnotatedClass(Employee.class)
                .buildSessionFactory();
    }

    public static SessionFactory getSessionFactory() {
        return SESSION_FACTORY;
    }

    public static void shutdown() {
        if (!SESSION_FACTORY.isClosed()) {
            SESSION_FACTORY.close();
        }
    }
}
