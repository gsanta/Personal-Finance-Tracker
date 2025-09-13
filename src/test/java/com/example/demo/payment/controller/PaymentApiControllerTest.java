package com.example.demo.payment.controller;

import com.example.demo.config.ManifestClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
public class PaymentApiControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.example.demo.payment.service.PaymentRepository paymentRepository;

    @MockBean
    private ManifestClient manifestClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void resetDb(@Autowired Flyway flyway) {
        ArrayNode emptyArray = objectMapper.createArrayNode();
        when(manifestClient.js(anyString())).thenReturn(emptyArray);
        when(manifestClient.css(anyString())).thenReturn(emptyArray);
    }

    @Test
    public void testListPaymentsSuccess() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/payments"))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentTypeCompatibleWith("application/json"));
    }

    @Test
    public void testCreatePaymentSuccess() throws Exception {
        String paymentJson = objectMapper.createObjectNode()
                .put("name", "Test Payment")
                .put("amount", 123.45)
                .put("is_income", true)
                .put("category", "Test Category")
                .toString();

        mockMvc.perform(MockMvcRequestBuilders.post("/api/payments")
                        .contentType("application/json")
                        .content(paymentJson))
                .andExpect(MockMvcResultMatchers.status().isCreated());
    }

    @Test
    public void testDeletePaymentsSuccess() throws Exception {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 1, org.springframework.data.domain.Sort.by("createdAt").descending());
        var page = paymentRepository.findAll(pageable);

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/payments/{id}", page.getContent().getFirst().getId()))
            .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

        @Test
    public void testDeletePaymentNotFound() throws Exception {
        // Use a random UUID that is unlikely to exist
        String invalidId = "00000000-0000-0000-0000-000000000000";
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/payments/{id}", invalidId))
            .andExpect(MockMvcResultMatchers.status().isNotFound());
    }
}
