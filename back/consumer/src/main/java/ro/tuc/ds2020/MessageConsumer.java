package ro.tuc.ds2020;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;


import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.Map;

@SpringBootApplication
public class MessageConsumer implements CommandLineRunner {

    private static final String RABBITMQ_URL = "amqps://sttsewny:eHEwYgQ_Lqw1KLHOL1fwFsA-jgassMT0@goose.rmq2.cloudamqp.com/sttsewny";
    private static final String RABBITMQ_URL2 = "amqps://ulqgzpsw:rfUlGb-ca0oURX78AtoBdB8hbSYA6Lbi@goose.rmq2.cloudamqp.com/ulqgzpsw";
    private static final String ENERGY_DATA_QUEUE = "energy-data-queue";
    private static final String EVENT_QUEUE = "event-data-queue";

    private static final Map<String, Double> hourlyConsumption = new HashMap<>();
    private final JdbcTemplate jdbcTemplate;

    public MessageConsumer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public static void main(String[] args) {
        SpringApplication.run(MessageConsumer.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting consumer for the first queue...");
        processQueue(RABBITMQ_URL, ENERGY_DATA_QUEUE);

        System.out.println("First queue processing finished. Starting consumer for the second queue...");
        processQueue(RABBITMQ_URL2, EVENT_QUEUE);

        System.out.println("Both queues have been processed. Press [enter] to exit.");
        System.in.read();
    }

    private void processQueue(String rabbitUrl, String queueName) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setUri(rabbitUrl);

            try (Connection rabbitConnection = factory.newConnection();
                 Channel channel = rabbitConnection.createChannel()) {


                channel.queueDeclare(queueName, false, false, false, null);
                System.out.println("Waiting for messages in queue: " + queueName + " at URL: " + rabbitUrl);

                DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                    String message = new String(delivery.getBody(), "UTF-8");


                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        Map<String, Object> messageData = objectMapper.readValue(message, Map.class);

                        if (queueName.equals(EVENT_QUEUE)) {
                            processEventDataMessage(messageData);
                        }
                        else if (queueName.equals(ENERGY_DATA_QUEUE)) {
                            processEnergyDataMessage(messageData);
                        }

                    } catch (Exception e) {
                        System.err.println("Error processing message: " + e.getMessage());
                        e.printStackTrace();
                    }
                };

                channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});


                waitForQueueToEmpty(channel, queueName);
            }
        } catch (Exception e) {
            System.err.println("Error connecting to RabbitMQ at URL: " + rabbitUrl);
            e.printStackTrace();
        }
    }

    private void waitForQueueToEmpty(Channel channel, String queueName) throws Exception {
        long startTime = System.currentTimeMillis();
        while (true) {
            AMQP.Queue.DeclareOk queueStatus = channel.queueDeclarePassive(queueName);
            int messageCount = queueStatus.getMessageCount();
            System.out.println("Queue: " + queueName + ", Message Count: " + messageCount);

            if (messageCount == 0) {
                System.out.println("Queue " + queueName + " is empty.");
                break;
            }

            if (System.currentTimeMillis() - startTime > 10000) {
                System.out.println("Timeout waiting for queue to empty: " + queueName);
                break;
            }
            Thread.sleep(1000);
        }
    }

    private void processEnergyDataMessage(Map<String, Object> energyDataMap) {
        if (!energyDataMap.containsKey("timestamp") || energyDataMap.get("timestamp") == null) {
            System.err.println("Invalid message: 'timestamp' is missing or null.");
            return;
        }

        if (!energyDataMap.containsKey("device_id") || energyDataMap.get("device_id") == null) {
            System.err.println("Invalid message: 'device_id' is missing or null.");
            return;
        }

        if (!energyDataMap.containsKey("measurement_value") || energyDataMap.get("measurement_value") == null) {
            System.err.println("Invalid message: 'measurement_value' is missing or null.");
            return;
        }

        try {
            long unixTimestamp = Long.parseLong(String.valueOf(energyDataMap.get("timestamp")));
            int deviceId = Integer.parseInt(String.valueOf(energyDataMap.get("device_id")));
            double measurementValue = Double.parseDouble(String.valueOf(energyDataMap.get("measurement_value")));

            String key = deviceId + "-" + unixTimestamp;

            hourlyConsumption.put(key,
                    hourlyConsumption.getOrDefault(key, 0.0) + measurementValue);

            long currentUnixTimestamp = System.currentTimeMillis() / 1000;
            if (unixTimestamp != currentUnixTimestamp) {
                Double totalConsumption = hourlyConsumption.remove(key);
                if (totalConsumption != null) {
                    saveHourlyConsumption(deviceId, unixTimestamp, totalConsumption);
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing energy data message: " + e.getMessage());
            e.printStackTrace();
        }
    }


    private int consumptionCount = 0;
    private Long initialHour = null;
    private void saveHourlyConsumption(int deviceId, long hour, double consumption) {
        String sql = "INSERT INTO hourly_energy_consumption (device_id, hour, energy_consumption, today) VALUES (?, ?, ?, ?)";
        try {
            Date today = new Date(hour * 1000); // Convert Unix timestamp to Date
            jdbcTemplate.update(sql, deviceId, hour, consumption, new java.sql.Date(today.getTime()));

            if (initialHour == null) {
                initialHour = hour;
                System.out.println("Initial hour set to: " + initialHour);
            }

            consumptionCount++;

            calculateAndInsertDifference(hour);

        } catch (Exception e) {
            System.err.println("Error saving hourly consumption: " + e.getMessage());
            e.printStackTrace();
        }
    }


    private void calculateAndInsertDifference(long hour1) {
        try {
            String query = "SELECT hour, device_id, energy_consumption, today FROM hourly_energy_consumption WHERE hour BETWEEN ? AND ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, hour1 - 3000, hour1);

            Map<Long, Map<Integer, Double>> hourlyConsumptionMap = new HashMap<>();
            for (Map<String, Object> row : results) {
                long dataHour = (long) row.get("hour");
                int deviceId = (int) row.get("device_id");
                double energyConsumption = (double) row.get("energy_consumption");
                Date today = (Date) row.get("today"); // Retrieve the Date

                hourlyConsumptionMap
                        .computeIfAbsent(dataHour, k -> new HashMap<>())
                        .put(deviceId, energyConsumption);

                System.out.println("Hour: " + dataHour + ", Device: " + deviceId + ", Energy: " + energyConsumption + ", Date: " + today);
            }

            if (consumptionCount % 6 == 0) {
                long pairedHour = hour1 - 3000;

                if (hourlyConsumptionMap.containsKey(hour1) && hourlyConsumptionMap.containsKey(pairedHour)) {
                    Map<Integer, Double> currentHourData = hourlyConsumptionMap.get(hour1);
                    Map<Integer, Double> pairedHourData = hourlyConsumptionMap.get(pairedHour);

                    for (Integer deviceId : currentHourData.keySet()) {
                        if (pairedHourData.containsKey(deviceId)) {
                            double currentEnergy = currentHourData.get(deviceId);
                            double pairedEnergy = pairedHourData.get(deviceId);
                            double difference = currentEnergy - pairedEnergy;

                            insertUpdateEvent(deviceId, hour1, difference);
                        }
                    }
                } else {
                    System.out.println("Data unavailable for paired hour: " + pairedHour);
                }
            }
        } catch (Exception e) {
            System.err.println("Error calculating differences: " + e.getMessage());
            e.printStackTrace();
        }
    }






    private void insertUpdateEvent(int deviceId, long hour, double difference) {
        String eventSql = "INSERT INTO events (device_id, event, hourly) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(eventSql, deviceId, "UPDATE", difference);
            System.out.println("Event 'UPDATE' inserted: Device " + deviceId + ", Hour " + hour + ", Difference " + difference);
        } catch (Exception e) {
            System.err.println("Error inserting 'UPDATE' event: " + e.getMessage());
            e.printStackTrace();
        }
    }



    private void processEventDataMessage(Map<String, Object> eventDataMap) {


        if (!eventDataMap.containsKey("id") || eventDataMap.get("id") == null) {
            System.err.println("Invalid message: 'id' is missing or null.");
            return;
        }


        if (!eventDataMap.containsKey("hourly") || eventDataMap.get("hourly") == null) {
            System.err.println("Invalid message: 'hourly' is missing or null.");
            return;
        }

        try {
            int deviceId = Integer.parseInt(String.valueOf(eventDataMap.get("id")));
            double hourlyValue = Double.parseDouble(String.valueOf(eventDataMap.get("hourly")));


            String sql = "INSERT INTO events (device_id, event, hourly) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, deviceId, "INITIALIZE", hourlyValue);

            System.out.println("Event inserted: Device " + deviceId + ", Event 'INITIALIZE', Hourly " + hourlyValue);
        } catch (Exception e) {
            System.err.println("Error saving event data: " + e.getMessage());
            e.printStackTrace();
        }
    }




}
