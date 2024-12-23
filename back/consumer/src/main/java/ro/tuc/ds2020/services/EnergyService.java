package ro.tuc.ds2020.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.entities.HourlyEnergyConsumption;
import ro.tuc.ds2020.repositories.HourlyEnergyConsumptionRepository;

import java.sql.Time;
import java.util.Date;


@Service
public class EnergyService {

    @Autowired
    private HourlyEnergyConsumptionRepository repository;


    public void saveHourlyEnergyConsumption(int deviceId, long hour, Double energyConsumption, Date today) {
        HourlyEnergyConsumption hourlyData = new HourlyEnergyConsumption(deviceId, hour, energyConsumption);
        repository.save(hourlyData);
    }
}
