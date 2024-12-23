package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.entities.Device;

public class DeviceBuilder {

    private DeviceBuilder() {
    }

    public static DeviceDTO toDeviceDTO(Device Device) {
        return new DeviceDTO(Device.getId(), Device.getDescription(), Device.getHourly(),Device.getAddress());
    }

    public static DeviceDetailsDTO toDeviceDetailsDTO(Device Device) {
        return new DeviceDetailsDTO(Device.getId(), Device.getDescription(), Device.getAddress(), Device.getHourly());
    }

    public static Device toEntity(DeviceDetailsDTO DeviceDetailsDTO) {
        return new Device(DeviceDetailsDTO.getDescription(),
                DeviceDetailsDTO.getAddress(),
                DeviceDetailsDTO.getHourly());
    }

}