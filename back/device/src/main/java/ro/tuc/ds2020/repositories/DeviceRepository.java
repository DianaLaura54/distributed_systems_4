package ro.tuc.ds2020.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, Integer> {


    /**
     * Example: JPA generate Query by Field
     */
    //List<Device> findByName(String name);
    //List<Device> findByAddress(String address);
    /**
     * Example: Write Custom Query
     */

    @Query("SELECT d FROM Device d WHERE d.Person.Id = :personId")
    List<Device> findDevicesByPersonId(@Param("personId") Integer personId);



}