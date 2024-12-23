package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDTO;
import ro.tuc.ds2020.dtos.HourlyEnergyConsumptionDetailsDTO;
import ro.tuc.ds2020.entities.HourlyEnergyConsumption;

public class HourlyEnergyConsumptionBuilder {

    private HourlyEnergyConsumptionBuilder() {
    }

    public static HourlyEnergyConsumptionDTO toHourlyEnergyConsumptionDTO(HourlyEnergyConsumption hourlyEnergyConsumption) {
        return new HourlyEnergyConsumptionDTO(
                hourlyEnergyConsumption.getId(),
                hourlyEnergyConsumption.getDeviceId(),
                hourlyEnergyConsumption.getHour(),
                hourlyEnergyConsumption.getEnergyConsumption()
        );
    }

    public static HourlyEnergyConsumptionDetailsDTO toHourlyEnergyConsumptionDetailsDTO(HourlyEnergyConsumption hourlyEnergyConsumption) {
        return new HourlyEnergyConsumptionDetailsDTO(
                hourlyEnergyConsumption.getId(),
                hourlyEnergyConsumption.getDeviceId(),
                hourlyEnergyConsumption.getHour(),
                hourlyEnergyConsumption.getEnergyConsumption()
        );
    }

    public static HourlyEnergyConsumption toEntity(HourlyEnergyConsumptionDetailsDTO hourlyEnergyConsumptionDetailsDTO) {
        return new HourlyEnergyConsumption(
                hourlyEnergyConsumptionDetailsDTO.getDeviceId(),
                hourlyEnergyConsumptionDetailsDTO.getHour(),
                hourlyEnergyConsumptionDetailsDTO.getEnergyConsumption()
        );
    }
}
