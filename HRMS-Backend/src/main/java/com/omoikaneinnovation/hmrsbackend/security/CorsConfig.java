import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;

// DISABLED — CORS is handled by SecurityConfig.corsConfigurationSource()
// Having multiple CORS configs causes "allowedOrigins cannot contain *" errors
// @Configuration
public class CorsConfig {




    @Value("${app.cors.allowedOrigins}")
    private String allowedOrigins;


    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {

                 String[] origins = Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .toArray(String[]::new);

                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}