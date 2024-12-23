package ro.tuc.ds2020.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.tuc.ds2020.entities.HourlyEnergyConsumption;


public interface HourlyEnergyConsumptionRepository extends JpaRepository<HourlyEnergyConsumption, Integer> {

    // You can define custom queries here if needed.
}
