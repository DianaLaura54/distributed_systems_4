package ro.tuc.ds2020.controllers;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.services.PersonService;
import ro.tuc.ds2020.security.JwtUtils;
import javax.validation.Valid;

import java.util.List;


import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@CrossOrigin
@RequestMapping(value = "/person")
public class PersonController {

    private final PersonService personService;
    private final JwtUtils jwtUtils;


    @Autowired
    public PersonController(PersonService personService,JwtUtils jwtUtils) {
        this.personService = personService;
        this.jwtUtils=jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody PersonDetailsDTO personDTO) {
        PersonDTO person = personService.authenticate(personDTO.getName(), personDTO.getPassword());
        if (person != null) {
            String token = jwtUtils.generateToken(person.getId().toString(), person.getRole());

            return ResponseEntity.ok().body(token);

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @GetMapping()
    public ResponseEntity<List<PersonDTO>> getPersons(@RequestHeader("Authorization") String authorizationHeader) {
        // Validate Authorization header
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Extract and validate the token
        String token = authorizationHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Extract user role and enforce access control
        String role = claims.get("role", String.class);
        if (!"admin".equals(role)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // Fetch the list of persons if authorized
        List<PersonDTO> dtos = personService.findPersons();
        for (PersonDTO dto : dtos) {
            Link personLink = linkTo(methodOn(PersonController.class)
                    .getPerson(dto.getId(), authorizationHeader)) // Add the Authorization header here for consistency
                    .withRel("personDetails");
            dto.add(personLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }



    @PostMapping("/add2")
    public ResponseEntity<Integer> insertProsumer(@RequestHeader("Authorization") String authorizationHeader, @Valid @RequestBody PersonDetailsDTO personDTO) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authorizationHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }


        String role = claims.get("role", String.class);


        System.out.println("Checking role: " + role); // Log the role value before checking
        if (!"admin".equals(role)) {
            System.out.println("Access denied, role is not admin");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (personService.isUsernameTaken(personDTO.getName())) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }

        Integer personID = personService.insert(personDTO);
        return new ResponseEntity<>(personID, HttpStatus.CREATED);
    }



    @PostMapping("/add")
    public ResponseEntity<?> insertProsumer2(@Valid @RequestBody PersonDetailsDTO personDTO) {
        // Check if the username is already taken
        if (personService.isUsernameTaken(personDTO.getName())) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }

        // Insert the user into the database
        Integer personID = personService.insert(personDTO);

        if (personID != null) {
            // After user is created, generate the JWT token
            PersonDetailsDTO person = personService.findPersonById(personID);  // Retrieve the person details
            String token = jwtUtils.generateToken(person.getId().toString(), person.getRole());

            // Return the token in the response
            return ResponseEntity.status(HttpStatus.CREATED).body(token);
        } else {
            // In case of any issue while inserting user
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred while creating user");
        }
    }



    @GetMapping(value = "/{id}")
    public ResponseEntity<PersonDetailsDTO> getPerson(
            @PathVariable("id") Integer personId,
            @RequestHeader("Authorization") String authorizationHeader) {

        // Validate Authorization header
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Extract and validate the token
        String token = authorizationHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Extract user role and enforce access control (e.g., only 'admin' can view details)
        String role = claims.get("role", String.class);
        if (!"admin".equals(role)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // Fetch the person details if authorized
        PersonDetailsDTO dto = personService.findPersonById(personId);
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(dto, HttpStatus.OK);
    }



    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deletePerson(
            @PathVariable("id") Integer personId,
            @RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authorizationHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String role = claims.get("role", String.class);
        if (!"admin".equals(role)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        // Authorization successful, proceed with the delete operation
        personService.deletePersonById(personId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<PersonDetailsDTO> updatePerson(
            @PathVariable("id") Integer personId,
            @Valid @RequestBody PersonDetailsDTO personDTO,
            @RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authorizationHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String role = claims.get("role", String.class);
        if (!"admin".equals(role)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        // Authorization successful, proceed with the update operation
        PersonDetailsDTO updatedPerson = personService.updatePerson(personId, personDTO);
        return new ResponseEntity<>(updatedPerson, HttpStatus.OK);
    }

}
