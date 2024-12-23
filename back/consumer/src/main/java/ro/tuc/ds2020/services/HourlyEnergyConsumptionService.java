package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDTO;
import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDetailsDTO;
import ro.tuc.ds2020.dtos.builders.HourlyEnergyConsumptionBuilder;
import ro.tuc.ds2020.entities.HourlyEnergyConsumption;
import ro.tuc.ds2020.repositories.HourlyEnergyConsumptionRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HourlyEnergyConsumptionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(HourlyEnergyConsumptionService.class);
    private final HourlyEnergyConsumptionRepository hourlyEnergyConsumptionRepository;

    @Autowired
    public HourlyEnergyConsumptionService(HourlyEnergyConsumptionRepository hourlyEnergyConsumptionRepository) {
        this.hourlyEnergyConsumptionRepository = hourlyEnergyConsumptionRepository;
    }

    public List<HourlyEnergyConsumptionDTO> findAllHourlyEnergyConsumptions() {
        List<HourlyEnergyConsumption> hourlyEnergyConsumptionList = hourlyEnergyConsumptionRepository.findAll();
        return hourlyEnergyConsumptionList.stream()
                .map(HourlyEnergyConsumptionBuilder::toHourlyEnergyConsumptionDTO)
                .collect(Collectors.toList());
    }

    public HourlyEnergyConsumptionDetailsDTO findHourlyEnergyConsumptionById(Integer id) {
        Optional<HourlyEnergyConsumption> hourlyEnergyConsumptionOptional =
                hourlyEnergyConsumptionRepository.findById(id);
        if (!hourlyEnergyConsumptionOptional.isPresent()) {
            LOGGER.error("HourlyEnergyConsumption with id {} was not found in db", id);
            throw new ResourceNotFoundException(HourlyEnergyConsumption.class.getSimpleName() + " with id: " + id);
        }
        return HourlyEnergyConsumptionBuilder.toHourlyEnergyConsumptionDetailsDTO(
                hourlyEnergyConsumptionOptional.get());
    }


}
