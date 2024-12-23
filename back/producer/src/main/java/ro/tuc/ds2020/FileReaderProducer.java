package ro.tuc.ds2020;

import com.opencsv.CSVReader;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.ConnectionFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;
//import ro.tuc.ds2020.config.properties;

import java.io.FileReader;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

@SpringBootApplication
@Component
@RequiredArgsConstructor
public class FileReaderProducer implements CommandLineRunner {

    private static final String RABBITMQ_URL = "amqps://sttsewny:eHEwYgQ_Lqw1KLHOL1fwFsA-jgassMT0@goose.rmq2.cloudamqp.com/sttsewny";
    private static final String RABBITMQ_URL2 = "amqps://ulqgzpsw:rfUlGb-ca0oURX78AtoBdB8hbSYA6Lbi@goose.rmq2.cloudamqp.com/ulqgzpsw";

    private static final String RABBITMQ_QUEUE1 = "energy-data-queue";
    private static final String RABBITMQ_QUEUE2 = "event-data-queue";

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private final TextFileConfigReader configReader;

    public static void main(String[] args) {
        SpringApplication.run(FileReaderProducer.class, args);
    }

    @Override
    public void run(String... args) {

        Properties configProperties = configReader.loadConfig();
        String deviceIdStr = configProperties.getProperty("device_id", "11");
        int deviceId = Integer.parseInt(deviceIdStr);


        System.out.println("Using device ID: " + deviceId);


        sendDbDataToQueue(deviceId);
         sendCsvDataToQueue(deviceId);
    }
private int n=0;
    private void sendCsvDataToQueue(int deviceId) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setUri(RABBITMQ_URL);

            try (com.rabbitmq.client.Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {
                System.out.println("Successfully connected to RabbitMQ at: " + RABBITMQ_URL);


                channel.queueDeclare(RABBITMQ_QUEUE1, false, false, false, null);


                CSVReader reader = new CSVReader(new FileReader("src/main/resources/sensor.csv"));
                String[] nextLine;


                while ((nextLine = reader.readNext()) != null) {

                    String measurementValueStr = nextLine[0];
                    double measurementValue = Double.parseDouble(measurementValueStr);


                    long timestamp = System.currentTimeMillis() / 1000;
timestamp=timestamp+n*599;
n++;

                    String message = String.format("{\"timestamp\": %d, \"device_id\": %d, \"measurement_value\": %f}",
                            timestamp, deviceId, measurementValue);


                    channel.basicPublish("", RABBITMQ_QUEUE1, null, message.getBytes());
                    System.out.println("Sent to Queue 1: " + message);


                    Thread.sleep(1000);
                }


                reader.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendDbDataToQueue(int deviceId) {
        try {

            ConnectionFactory factory = new ConnectionFactory();
            factory.setUri(RABBITMQ_URL2);

            try (com.rabbitmq.client.Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {

                System.out.println("Successfully connected to RabbitMQ at: " + RABBITMQ_URL2);


                channel.queueDeclare(RABBITMQ_QUEUE2, false, false, false, null);


                try (java.sql.Connection dbConnection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                     Statement statement = dbConnection.createStatement()) {


                    String query = "SELECT id, hourly FROM device WHERE id = " + deviceId;
                    ResultSet resultSet = statement.executeQuery(query);


                    while (resultSet.next()) {
                        int id = resultSet.getInt("id");
                        double hourly = resultSet.getDouble("hourly");


                        String message = String.format("{\"id\": \"%d\", \"hourly\": \"%f\"}", id, hourly);


                        channel.basicPublish("", RABBITMQ_QUEUE2, null, message.getBytes());
                        System.out.println("Sent to Queue 2: " + message);


                        Thread.sleep(1000);
                    }

                } catch (Exception dbEx) {
                    System.err.println("Database error: " + dbEx.getMessage());
                    dbEx.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("Error in RabbitMQ connection or publishing: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
