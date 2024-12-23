package ro.tuc.ds2020.entities;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "hourly_energy_consumption")
public class HourlyEnergyConsumption implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "device_id", nullable = false)
    private int deviceId;

    @Column(name = "hour", nullable = false)
    private long hour;

    @Column(name = "energy_consumption", nullable = false)
    private Double energyConsumption;



    // Default constructor
    public HourlyEnergyConsumption() {
    }

    public HourlyEnergyConsumption(int deviceId, long hour, Double energyConsumption) {
        this.deviceId = deviceId;
        this.hour = hour;
        this.energyConsumption = energyConsumption;

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(int deviceId) {
        this.deviceId = deviceId;
    }

    public long getHour() {
        return hour;
    }

    public void setHour(long hour) {
        this.hour = hour;
    }

    public Double getEnergyConsumption() {
        return energyConsumption;
    }

    public void setEnergyConsumption(Double energyConsumption) {
        this.energyConsumption = energyConsumption;
    }



    @Override
    public String toString() {
        return "HourlyEnergyConsumption{" +
                "id=" + id +
                ", deviceId=" + deviceId +
                ", hour=" + hour +
                ", energyConsumption=" + energyConsumption +
                '}';
    }
}
