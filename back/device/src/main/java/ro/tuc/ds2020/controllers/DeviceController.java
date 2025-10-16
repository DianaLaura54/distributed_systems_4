package ro.tuc.ds2020.controllers;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.services.DeviceService;
import ro.tuc.ds2020.services.PersonService;

import javax.validation.Valid;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@CrossOrigin
@RequestMapping(value = "/device")
public class DeviceController {

    private final DeviceService deviceService;
    private final PersonService personService;

    @Autowired
    public DeviceController(DeviceService deviceService, PersonService personService) {
        this.deviceService = deviceService;
        this.personService = personService;
    }


    private Claims authenticate(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        String token = authorizationHeader.substring(7);
        try {
            return Jwts.parser()
                    .setSigningKey("xyggxfgcfguyuyyuyuyuyuyuyuycgfucfgucghicghichgicg")
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new RuntimeException("Unauthorized");
        }
    }

    private void authorizeAdmin(Claims claims) {
        String role = claims.get("role", String.class);
        if (!"admin".equals(role)) {
            throw new RuntimeException("Forbidden");
        }
    }

    @GetMapping()
    public ResponseEntity<List<DeviceDTO>> getDevices(@RequestHeader("Authorization") String authorizationHeader) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        List<DeviceDTO> dtos = deviceService.findDevices();
        for (DeviceDTO dto : dtos) {
            Link deviceLink = linkTo(methodOn(DeviceController.class).getDevice(authorizationHeader, dto.getId())).withRel("DeviceDetails");
            dto.add(deviceLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Integer> insertDevice(@RequestHeader("Authorization") String authorizationHeader, @Valid @RequestBody DeviceDetailsDTO deviceDTO) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        Integer deviceID = deviceService.insert(deviceDTO);
        return new ResponseEntity<>(deviceID, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<DeviceDetailsDTO> getDevice(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("id") Integer deviceId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        DeviceDetailsDTO dto = deviceService.findDeviceById(deviceId);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @GetMapping(value = "/person/{clientId}")
    public ResponseEntity<List<DeviceDetailsDTO>> getDeviceByClient( @PathVariable("clientId") Integer clientId) {
        List<DeviceDetailsDTO> dtos = deviceService.linkPersonToDevice(clientId);
        if (dtos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping("/person")
    public ResponseEntity<List<PersonDTO>> getPersons(@RequestHeader("Authorization") String authorizationHeader) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        List<PersonDTO> dtos = personService.findPersons();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteDevice(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("id") Integer deviceId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        deviceService.deleteDeviceById(deviceId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<DeviceDetailsDTO> updateDevice(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("id") Integer deviceId, @Valid @RequestBody DeviceDetailsDTO deviceDTO) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        DeviceDetailsDTO updatedDevice = deviceService.updateDevice(deviceId, deviceDTO);
        return new ResponseEntity<>(updatedDevice, HttpStatus.OK);
    }

    @PostMapping("/person/insert/{clientId}/{deviceId}")
    public ResponseEntity<String> insertPersonWithClientIdAndDeviceId(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("clientId") Integer clientId, @PathVariable("deviceId") Integer deviceId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        try {
            deviceService.insertPersonWithClientId(clientId, deviceId);
            return ResponseEntity.ok("Person with Client ID " + clientId + " linked to Device ID " + deviceId + " successfully.");
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/person/update/{clientId}/{deviceId}")
    public ResponseEntity<String> updatePersonWithClientIdAndDeviceId(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("clientId") Integer clientId, @PathVariable("deviceId") Integer deviceId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        try {
            deviceService.updatePersonWithClientId(clientId, deviceId);
            return ResponseEntity.ok("Person with Client ID " + clientId + " updated to Device ID " + deviceId + " successfully.");
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "person/delete/{clientId}")
    public ResponseEntity<Void> deleteDevices(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("clientId") Integer clientId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        deviceService.deleteDevicesByClientId(clientId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{clientId}")
    public ResponseEntity<Void> insertPerson(@RequestHeader("Authorization") String authorizationHeader, @PathVariable("clientId") Integer clientId) {
        Claims claims = authenticate(authorizationHeader);
        authorizeAdmin(claims);
        personService.addPerson(clientId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
