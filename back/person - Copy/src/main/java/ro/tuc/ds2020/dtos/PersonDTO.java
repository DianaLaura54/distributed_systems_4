package ro.tuc.ds2020.dtos;

import org.springframework.hateoas.RepresentationModel;

import java.util.Objects;
import java.util.UUID;

public class PersonDTO extends RepresentationModel<PersonDTO> {
    private Integer Id;
    private String name;

    private String password;
    String role;

    public PersonDTO() {
    }

    public PersonDTO(Integer Id, String name,String role, String password) {
        this.Id = Id;
        this.name = name;
        this.role=role;
        this.password=password;
    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer Id) {
        this.Id = Id;
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
        PersonDTO personDTO = (PersonDTO) o;
        return
                Objects.equals(name, personDTO.name) && Objects.equals(role,personDTO.role)  && Objects.equals(password,personDTO.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name,role,password);
    }
}