package ro.tuc.ds2020.dtos;

import ro.tuc.ds2020.dtos.validators.annotation.AgeLimit;

import javax.validation.constraints.NotNull;
import java.util.Objects;
import java.util.UUID;

public class PersonDetailsDTO {

    private Integer Id;
    @NotNull
    private String name;

    @NotNull
    private String role;
    @NotNull
    private String password;

    public PersonDetailsDTO() {
    }

    public PersonDetailsDTO( String name,String role,String password) {
        this.name = name;
        this.role=role;
        this.password=password;
    }

    public PersonDetailsDTO(Integer Id, String name,String role,String password) {
        this.Id = Id;
        this.name = name;

        this.role=role;
        this.password=password;
    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer id) {
        this.Id=Id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }



    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersonDetailsDTO that = (PersonDetailsDTO) o;
        return
                Objects.equals(name, that.name) &&
                        Objects.equals(role,that.role) && Objects.equals(password,that.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, role,password);
    }
}