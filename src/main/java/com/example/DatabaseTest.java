package com.example;

import org.hibernate.Session;
import org.hibernate.SessionFactory;

public class DatabaseTest {

    public static void main(String[] args) {

        SessionFactory factory = null;

        try {
            factory = HibernateUtil.getSessionFactory();

            try (Session session = factory.openSession()) {
                session.doWork(connection -> {
                    System.out.println(
                        "Database: "
                        + connection.getCatalog()
                    );

                    System.out.println(
                        "Connection valid: "
                        + connection.isValid(5)
                    );
                });
            }

            System.out.println(
                "SUCCESS: Hibernate connected to MySQL!"
            );

        } catch (Exception e) {
            System.err.println(
                "FAILED: Could not connect to MySQL."
            );
            e.printStackTrace();

        } finally {
            HibernateUtil.shutdown();
        }
    }
}
