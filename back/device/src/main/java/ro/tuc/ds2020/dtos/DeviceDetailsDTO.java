package ro.tuc.ds2020.dtos;

import ro.tuc.ds2020.dtos.validators.annotation.AgeLimit;

import javax.validation.constraints.NotNull;
import java.util.Objects;
import java.util.UUID;

public class DeviceDetailsDTO {

    private Integer id;
    @NotNull
    private String description;
    @NotNull
    private String address;
    @NotNull
    private int hourly;


    public DeviceDetailsDTO() {
    }

    public DeviceDetailsDTO( String description, String address, int hourly) {
        this.description=description;
        this.address = address;
        this.hourly=hourly;

    }

    public DeviceDetailsDTO(Integer id, String description, String address, int hourly) {
        this.id = id;
        this.description=description;
        this.address = address;
        this.hourly=hourly;

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getHourly() {
        return hourly;
    }

    public void setHourly(int hourly) {
        this.hourly = hourly;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeviceDetailsDTO that = (DeviceDetailsDTO) o;
        return hourly == that.hourly &&
                Objects.equals(description, that.description) &&
                Objects.equals(address, that.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(description, address, hourly);
    }
}