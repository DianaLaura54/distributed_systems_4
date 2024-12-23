package ro.tuc.ds2020.dtos;



public class PersonDetailsDTO {

    private Integer Id;


    public PersonDetailsDTO() {
    }


    public PersonDetailsDTO(Integer Id) {
        this.Id = Id;

    }

    public Integer getId() {
        return Id;
    }

    public void setId(Integer id) {
        this.Id=Id;
    }

}
