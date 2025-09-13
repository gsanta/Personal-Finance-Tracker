package com.example.demo.payment;

import com.example.demo.ManifestClient;
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
    public void testDeletePaymentsSuccess() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/payments/{id}", "eef7d5f0-cc45-459e-90dd-7e86120150ff"))
        .andExpect(MockMvcResultMatchers.status().isOk());
    }
}
