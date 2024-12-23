package ro.tuc.ds2020.entities;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;


@Entity
public class Device  implements Serializable{

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer Id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "hourly", nullable = false)
    private int hourly;

    @ManyToOne

    private Person Person;

    public Device() {
    }

    public Device(String description, String address, int hourly) {
        this.description=description;
        this.address = address;
        this.hourly=hourly;

    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer Id) {
        this.Id=Id;
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

    public ro.tuc.ds2020.entities.Person getPerson() {
        return Person;
    }

    public void setPerson(ro.tuc.ds2020.entities.Person person) {
        Person = person;
    }
}
