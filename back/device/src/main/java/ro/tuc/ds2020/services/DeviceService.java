package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.dtos.builders.DeviceBuilder;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.PersonRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeviceService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final DeviceRepository DeviceRepository;
    private final PersonRepository PersonRepository;


    @Autowired
    public DeviceService(DeviceRepository DeviceRepository, PersonRepository PersonRepository) {
        this.DeviceRepository = DeviceRepository;
        this.PersonRepository = PersonRepository;
    }

    public List<DeviceDTO> findDevices() {
        List<Device> DeviceList = DeviceRepository.findAll();
        return DeviceList.stream()
                .map(DeviceBuilder::toDeviceDTO)
                .collect(Collectors.toList());
    }
    public List<DeviceDetailsDTO> linkPersonToDevice(Integer clientId) {
        List<Device> devices = DeviceRepository.findDevicesByPersonId(clientId);
        if (devices.isEmpty()) {
            LOGGER.info("No devices found for person with id {}", clientId);
        } else {
            LOGGER.info("Found {} devices for person with id {}", devices.size(), clientId);
        }
        // Convert List<Device> to List<DeviceDetailsDTO> using the provided method
        return devices.stream()
                .map(DeviceBuilder::toDeviceDetailsDTO) // Use the new method for mapping
                .collect(Collectors.toList());
    }



    public DeviceDetailsDTO findDeviceById(Integer id) {
        Optional<Device> prosumerOptional = DeviceRepository.findById(id);
        if (!prosumerOptional.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        return DeviceBuilder.toDeviceDetailsDTO(prosumerOptional.get());
    }

    public DeviceDetailsDTO deleteDeviceById(Integer id) {
        Optional<Device> prosumerOptional = DeviceRepository.findById(id);
        if (!prosumerOptional.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        DeviceRepository.deleteById(id);
        LOGGER.info("Device with id {} was deleted from the db", id);

        return DeviceBuilder.toDeviceDetailsDTO(prosumerOptional.get());
    }


    public DeviceDetailsDTO updateDevice(Integer id, DeviceDetailsDTO DeviceDTO) {
        Optional<Device> DeviceOptional = DeviceRepository.findById(id);
        if (!DeviceOptional.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        Device Device = DeviceOptional.get();
        Device.setDescription(DeviceDTO.getDescription());
        Device.setAddress(DeviceDTO.getAddress());
        Device.setHourly(DeviceDTO.getHourly());
        Device = DeviceRepository.save(Device);
        LOGGER.info("Device with id {} was updated in the db", Device.getId());
        return DeviceBuilder.toDeviceDetailsDTO(Device);
    }


    public Integer insert(DeviceDetailsDTO DeviceDTO) {
        Device Device = DeviceBuilder.toEntity(DeviceDTO);
        Device = DeviceRepository.save(Device);
        LOGGER.debug("Device with id {} was inserted in db", Device.getId());
        return Device.getId();
    }

    public void insertPersonWithClientId(Integer clientId, Integer deviceId) {

        Person person = PersonRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Person with ID " + clientId + " not found."));
        System.out.println("Found existing Person with ID " + person.getId());
        Device device = DeviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device with ID " + deviceId + " not found."));
        System.out.println("Found Device with ID " + device.getId());
        if (device.getPerson() != null && !device.getPerson().getId().equals(clientId)) {
            System.out.println("Device ID " + device.getId() + " is already assigned to another Person (ID: " + device.getPerson().getId() + ").");
            throw new IllegalStateException("Device with ID " + deviceId + " is already assigned to a different Person.");
        }
        device.setPerson(person);
        System.out.println("Linking Person ID " + person.getId() + " to Device ID " + device.getId());
        DeviceRepository.save(device);
        System.out.println("Successfully assigned Device ID " + deviceId + " to Person ID " + clientId);
    }


    public void updatePersonWithClientId(Integer clientId, Integer deviceId) {
        Person person = PersonRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Person with ID " + clientId + " not found."));
        System.out.println("Found existing Person with ID " + person.getId());
        Optional<Device> optionalDevice = DeviceRepository.findById(deviceId);
        if (optionalDevice.isPresent()) {
            Device device = optionalDevice.get();
            System.out.println("Found Device with ID " + device.getId());
            device.setPerson(person);
            System.out.println("Updated Device ID " + device.getId() + " to Person ID " + person.getId());
            PersonRepository.save(person);
            DeviceRepository.save(device);
            System.out.println("Successfully updated Device ID " + deviceId + " to Person ID " + clientId);
        } else {
            System.out.println("Device with ID " + deviceId + " not found.");
            throw new ResourceNotFoundException("Device with ID " + deviceId + " not found.");
        }
    }

    public void deleteDevicesByClientId(Integer idClient) {
        List<Device> deviceList = DeviceRepository.findAll();
        List<Device> assignedDevices = deviceList.stream()
                .filter(device -> device.getPerson() != null && device.getPerson().getId().equals(idClient))
                .collect(Collectors.toList());
        for (Device device : assignedDevices) {
            device.setPerson(null);
            DeviceRepository.save(device);
        }
        PersonRepository.deleteById(idClient);
    }



}
