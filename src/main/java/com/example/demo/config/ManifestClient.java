package com.example.demo.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ManifestClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode manifest;

    @Value("${manifest.host}")
    private String manifestHost;
    
    public JsonNode js(String entry) {
      this.fetchManifest();
      if (manifest != null && manifest.has("entrypoints")) {
          JsonNode entryNode = manifest.get("entrypoints").get(entry);
          if (entryNode != null && entryNode.has("assets") && entryNode.get("assets").has("js")) {
              return entryNode.get("assets").get("js");
          }
      }

      return objectMapper.createArrayNode();
    }

    public JsonNode css(String entry) {
        this.fetchManifest();
        if (manifest != null && manifest.has("entrypoints")) {
            JsonNode entryNode = manifest.get("entrypoints").get(entry);

            if (entryNode != null && entryNode.has("assets") && entryNode.get("assets").has("css")) {
                return manifest.get("entrypoints").get(entry).get("assets").get("css");
            }
        }

        return objectMapper.createArrayNode();
    }

    private void fetchManifest() {
//        if (this.manifest != null) {
//            return;
//        }
        System.out.println("Manifest host: " + manifestHost);
        String url = manifestHost + "/version-dev/manifest.json";
        String manifestStr = restTemplate.getForObject(url, String.class);
        try {
            this.manifest = objectMapper.readTree(manifestStr);
        } catch (Exception e) {



            this.manifest = null;
        }
    }
}
