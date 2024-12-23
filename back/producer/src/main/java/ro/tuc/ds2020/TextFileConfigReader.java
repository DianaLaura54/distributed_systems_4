package ro.tuc.ds2020;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;

@Component
public class TextFileConfigReader {

    private final String configFilePath = "src/main/resources/properties";

    public Properties loadConfig() {
        Properties properties = new Properties();

        try (BufferedReader reader = new BufferedReader(new FileReader(new File(configFilePath)))) {
            String line;
            while ((line = reader.readLine()) != null) {

                if (line.trim().isEmpty() || line.startsWith("#")) {
                    continue;
                }


                String[] keyValue = line.split("=");
                if (keyValue.length == 2) {
                    properties.setProperty(keyValue[0].trim(), keyValue[1].trim());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();

        }

        return properties;
    }
}
