package com.example.demo.config;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.ui.Model;

@ControllerAdvice
public class GlobalModelAttributes {
    @Autowired
    private ManifestClient manifestClient = new ManifestClient();

    @ModelAttribute
    public void addCurrentUrl(Model model, HttpServletRequest request) {

        String uri = request.getRequestURI();
        String formattedUri = uri.replace("-", "_");
        String entry = "pages" + formattedUri + "/entry";

        JsonNode jsArray = manifestClient.js(entry);
        JsonNode cssArray = manifestClient.css(entry);


        model.addAttribute("js", jsArray);
        model.addAttribute("css", cssArray);
    }
}
