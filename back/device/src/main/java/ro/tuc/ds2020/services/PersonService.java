package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.PersonRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class PersonService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final PersonRepository PersonRepository;
    private final DeviceRepository DeviceRepository;


    @Autowired
    public PersonService(PersonRepository PersonRepository,DeviceRepository DeviceRepository) {

        this.PersonRepository = PersonRepository;
        this.DeviceRepository = DeviceRepository;
    }
    public void addPerson(Integer clientId) {

        Person person = new Person();
        person.setId(clientId);

        PersonRepository.save(person);
        System.out.println(clientId);
    }
    public List<PersonDTO> findPersons() {
        List<Device> deviceList = DeviceRepository.findAll();


        List<PersonDTO> personDTOList = new ArrayList<>();

        for (Device device : deviceList) {

            Person person = device.getPerson();


            PersonDTO personDTO = new PersonDTO();


            if (person != null) {
                personDTO.setId(person.getId());

            } else {

                personDTO.setId(null);

            }

            personDTOList.add(personDTO);
        }

        return personDTOList;
    }
}
