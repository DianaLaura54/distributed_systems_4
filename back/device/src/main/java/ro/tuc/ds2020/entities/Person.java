package ro.tuc.ds2020.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Person {

    @Id
    private Integer Id;

    public void setId(Integer Id) {
        this.Id = Id;
    }

    public Integer getId() {
        return Id;
    }
    @OneToMany
    private List <Device> devices;

    public List<Device> getDevices() {
        return devices;
    }

    public void setDevices(List<Device> devices) {
        this.devices = devices;
    }
}
