package ro.tuc.ds2020.dtos;

import org.springframework.hateoas.RepresentationModel;



public class PersonDTO extends RepresentationModel<PersonDTO> {
    private Integer Id;


    public PersonDTO() {
    }

    public PersonDTO(Integer Id) {
        this.Id = Id;

    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer Id) {
        this.Id = Id;
    }


}
