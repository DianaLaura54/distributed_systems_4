package ro.tuc.ds2020.dtos;

import org.springframework.hateoas.RepresentationModel;

import java.util.Objects;
import java.util.UUID;

public class DeviceDTO extends RepresentationModel<DeviceDTO> {
    private Integer id;
    private String description;
    private String address;
    private int hourly;


    public DeviceDTO() {
    }

    public DeviceDTO(Integer id,String description, int hourly,String address) {
        this.id = id;
        this.description=description;
        this.address=address;
        this.hourly=hourly;

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeviceDTO DeviceDTO = (DeviceDTO) o;
        return hourly == DeviceDTO.hourly &&
                Objects.equals(description, DeviceDTO.description) && Objects.equals(address,DeviceDTO.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(description,hourly,address);
    }
}