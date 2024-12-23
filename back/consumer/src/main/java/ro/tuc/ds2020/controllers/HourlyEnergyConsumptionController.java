package ro.tuc.ds2020.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDTO;
import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDetailsDTO;
import ro.tuc.ds2020.entities.HourlyEnergyConsumption;
import ro.tuc.ds2020.services.HourlyEnergyConsumptionService;

import javax.validation.Valid;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@CrossOrigin
@RequestMapping(value = "/event")
public class HourlyEnergyConsumptionController {

    private final HourlyEnergyConsumptionService hourlyEnergyConsumptionService;

    @Autowired
    public HourlyEnergyConsumptionController(HourlyEnergyConsumptionService hourlyEnergyConsumptionService) {
        this.hourlyEnergyConsumptionService = hourlyEnergyConsumptionService;
    }

    @GetMapping()
    public ResponseEntity<List<HourlyEnergyConsumptionDTO>> getHourlyEnergyConsumptions() {
        List<HourlyEnergyConsumptionDTO> dtos = hourlyEnergyConsumptionService.findAllHourlyEnergyConsumptions();
        for (HourlyEnergyConsumptionDTO dto : dtos) {
            Link hourlyEnergyLink = linkTo(methodOn(HourlyEnergyConsumptionController.class)
                    .getHourlyEnergyConsumption(dto.getId())).withRel("hourlyEnergyDetails");
            dto.add(hourlyEnergyLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }



    @GetMapping(value = "/{id}")
    public ResponseEntity<HourlyEnergyConsumptionDetailsDTO> getHourlyEnergyConsumption(
            @PathVariable("id") Integer id) {
        HourlyEnergyConsumptionDetailsDTO dto = hourlyEnergyConsumptionService.findHourlyEnergyConsumptionById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }




}
