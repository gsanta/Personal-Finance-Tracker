//package com.example.demo.payment;
//
//import org.flywaydb.core.Flyway;
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.web.client.TestRestTemplate;
//import org.springframework.http.ResponseEntity;
//import org.springframework.test.context.ActiveProfiles;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@ActiveProfiles("test")
//@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//public class PaymentApiIntegrationTest {
//
//    @Autowired
//    private TestRestTemplate restTemplate;
//
//    @BeforeEach
//    void resetDb(@Autowired Flyway flyway) {
//        flyway.clean();
//        flyway.migrate();
//    }
//
//    @Test
//    void testGetPayments() {
//        ResponseEntity<PaymentsPresenter> response = restTemplate.getForEntity("/api/payments", PaymentsPresenter.class);
//        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
//        assertThat(response.getBody().getTotalCount()).isEqualTo(20);
//        assertThat(response.getBody().getItems().size()).isEqualTo(10);
//        assertThat(response.getBody().getItems().get(0).getName()).isEqualTo("Pizza");
//    }
//
//    @Test
//    void testGetPaymentsPage2() {
//        ResponseEntity<PaymentsPresenter> response = restTemplate.getForEntity("/api/payments?page=2", PaymentsPresenter.class);
//        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
//        assertThat(response.getBody().getTotalCount()).isEqualTo(20);
//        assertThat(response.getBody().getItems().size()).isEqualTo(10);
//        assertThat(response.getBody().getItems().get(0).getName()).isEqualTo("Dining Out");
//    }
//
//    @Test
//    void testCreatePayment() {
//        Payment newPayment = new Payment();
//        newPayment.setName("Test Payment");
//        newPayment.setAmount(new java.math.BigDecimal("123.45"));
//        newPayment.setIsIncome(false);
//        newPayment.setCategory("Test Category");
//
//        ResponseEntity<Void> response = restTemplate.postForEntity("/api/payments", newPayment, Void.class);
//        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
//        ResponseEntity<PaymentsPresenter> getResponse = restTemplate.getForEntity("/api/payments", PaymentsPresenter.class);
//        boolean found = getResponse.getBody().getItems().stream().anyMatch(p -> "Test Payment".equals(p.getName()));
//        assertThat(found).isTrue();
//    }
//
//    @Test
//    void testDeletePayment() {
//        ResponseEntity<PaymentsPresenter> getResponse = restTemplate.getForEntity("/api/payments", PaymentsPresenter.class);
//        Payment created = getResponse.getBody().getItems().stream()
//            .filter(p -> "Pizza".equals(p.getName()))
//            .findFirst()
//            .orElseThrow(() -> new AssertionError("Created payment not found"));
//
//        restTemplate.delete("/api/payments/" + created.getId());
//
//        ResponseEntity<PaymentsPresenter> afterDeleteResponse = restTemplate.getForEntity("/api/payments", PaymentsPresenter.class);
//        boolean stillExists = afterDeleteResponse.getBody().getItems().stream().anyMatch(p -> "Pizza".equals(p.getName()));
//        assertThat(stillExists).isFalse();
//    }
//}
