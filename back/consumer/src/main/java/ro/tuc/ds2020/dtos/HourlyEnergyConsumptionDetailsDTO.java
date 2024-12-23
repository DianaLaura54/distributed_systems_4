package ro.tuc.ds2020.dtos;

import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.Objects;

public class HourlyEnergyConsumptionDetailsDTO {

    private Integer id;

    @NotNull
    private int deviceId;

    @NotNull
    private long hour;

    @NotNull
    private Double energyConsumption;



    // Default constructor
    public HourlyEnergyConsumptionDetailsDTO() {
    }

    public HourlyEnergyConsumptionDetailsDTO(int deviceId, long hour, Double energyConsumption) {
        this.deviceId = deviceId;
        this.hour = hour;
        this.energyConsumption = energyConsumption;

    }

    public HourlyEnergyConsumptionDetailsDTO(Integer id, int deviceId, long hour, Double energyConsumption) {
        this.id = id;
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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HourlyEnergyConsumptionDetailsDTO that = (HourlyEnergyConsumptionDetailsDTO) o;
        return deviceId == that.deviceId &&
                hour == that.hour &&
                Objects.equals(energyConsumption, that.energyConsumption);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deviceId, hour, energyConsumption);
    }

    @Override
    public String toString() {
        return "HourlyEnergyConsumptionDetailsDTO{" +
                "id=" + id +
                ", deviceId=" + deviceId +
                ", hour=" + hour +
                ", energyConsumption=" + energyConsumption +
                '}';
    }
}
