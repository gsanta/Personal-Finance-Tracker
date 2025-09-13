//package com.example.demo.payment;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
//import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//public class PaymentApiControllerTest {
//
//  @Autowired
//  private MockMvc mockMvc;
//
//  @Test
//  public void testDeletePaymentsSuccess() throws Exception {
//    mockMvc.perform(MockMvcRequestBuilders.delete("/api/payments/{id}", "eef7d5f0-cc45-459e-90dd-7e86120150ff"))
//       .andExpect(MockMvcResultMatchers.status().isOk());
//  }
//}
