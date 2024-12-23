package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.dtos.builders.PersonBuilder;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.PersonRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PersonService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PersonService.class);
    private final PersonRepository personRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public PersonService(PersonRepository personRepository,RestTemplate restTemplate) {
        this.personRepository = personRepository;
        this.restTemplate=restTemplate;
    }

    public List<PersonDTO> findPersons() {
        List<Person> personList = personRepository.findAll();
        return personList.stream()
                .map(PersonBuilder::toPersonDTO)
                .collect(Collectors.toList());
    }

    public PersonDetailsDTO findPersonById(Integer id) {
        Optional<Person> personOptional = personRepository.findById(id);
        if (!personOptional.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }
        return PersonBuilder.toPersonDetailsDTO(personOptional.get());
    }

    public Integer insert(PersonDetailsDTO personDTO) {
        Person person = PersonBuilder.toEntity(personDTO);
        person = personRepository.save(person);
        LOGGER.debug("Person with id {} was inserted in db", person.getId());

        return person.getId();

    }

    public PersonDetailsDTO deletePersonById(Integer id) {
        Optional<Person> personOptional = personRepository.findById(id);
        if (!personOptional.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }

        personRepository.deleteById(id);
        LOGGER.info("Person with id {} was deleted from the db", id);

        return PersonBuilder.toPersonDetailsDTO(personOptional.get());
    }

    public PersonDetailsDTO updatePerson(Integer id, PersonDetailsDTO personDTO) {
        Optional<Person> personOptional = personRepository.findById(id);
        if (!personOptional.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }
        Person person = personOptional.get();

        person.setName(personDTO.getName());
        person.setRole(personDTO.getRole());
        person.setPassword(personDTO.getPassword());
        person = personRepository.save(person);
        LOGGER.info("Person with id {} was updated in the db", person.getId());
        return PersonBuilder.toPersonDetailsDTO(person);
    }


    public PersonDTO authenticate(String name, String password) {

        Optional<Person> optionalPerson = personRepository.findByName(name);


        System.out.println("Attempting to authenticate user with Name: " + name + " and Password: " + password);

        if (optionalPerson.isPresent()) {
            Person person = optionalPerson.get();

            System.out.println("User found: " + person.getName());


            if (person.getPassword().equals(password)) {

                return new PersonDTO(person.getId(), person.getName(), person.getRole(), person.getPassword());
            } else {
                System.out.println("Authentication failed for user: " + name + ". Incorrect password.");
            }
        } else {
            System.out.println("Authentication failed. No user found with the name: " + name);
        }

        return null;
    }

    public void show(int clientId) {

        try {

            String microserviceUrl = "http://localhost:8081/device/person/";

            microserviceUrl = microserviceUrl + clientId;

            ResponseEntity<String> response = restTemplate.postForEntity(microserviceUrl, clientId, String.class);

            LOGGER.debug("Response from microservice: {}", response.getBody());
        } catch (Exception e) {
            LOGGER.error("Error calling microservice: {}", e.getMessage());

        }
    }
    public void insert2(int idDevice,int clientId) {

        try {

            String microserviceUrl = "http://localhost:8081/device/person/insert";

            microserviceUrl = microserviceUrl + clientId + "/" + idDevice;

            ResponseEntity<String> response = restTemplate.postForEntity(microserviceUrl, null, String.class);

            LOGGER.debug("Response from microservice: {}", response.getBody());
        } catch (Exception e) {
            LOGGER.error("Error calling microservice: {}", e.getMessage());

        }

        LOGGER.debug("Person with id {} was inserted in db", clientId);

    }
    public void update2(int idDevice,int clientId) {

        try {

            String microserviceUrl = "http://localhost:8081/device/person/update";

            microserviceUrl = microserviceUrl + clientId + "/" + idDevice;

            ResponseEntity<String> response = restTemplate.postForEntity(microserviceUrl, null, String.class);

            LOGGER.debug("Response from microservice: {}", response.getBody());
        } catch (Exception e) {
            LOGGER.error("Error calling microservice: {}", e.getMessage());

        }

    }
    public void delete2(int idDevice,int clientId) {

        try {

            String microserviceUrl = "http://localhost:8081/device/person/delete";

            microserviceUrl = microserviceUrl + clientId + "/" + idDevice;

            ResponseEntity<String> response = restTemplate.postForEntity(microserviceUrl, null, String.class);

            LOGGER.debug("Response from microservice: {}", response.getBody());
        } catch (Exception e) {
            LOGGER.error("Error calling microservice: {}", e.getMessage());

        }

    }
    public void insertPerson(int clientId) {

        try {

            String microserviceUrl = "http://localhost:8081/device/";

            microserviceUrl = microserviceUrl + clientId;

            ResponseEntity<String> response = restTemplate.postForEntity(microserviceUrl, null, String.class);

            LOGGER.debug("Response from microservice: {}", response.getBody());
        } catch (Exception e) {
            LOGGER.error("Error calling microservice: {}", e.getMessage());

        }

    }
    public boolean isUsernameTaken(String name) {
        return personRepository.existsByName(name);
    }




}
