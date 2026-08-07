package com.sources.mechanicstream.service;

import com.sources.mechanicstream.dto.car.CarResponse;
import com.sources.mechanicstream.dto.car.CreateCarRequest;
import com.sources.mechanicstream.dto.car.UpdateCarRequest;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.Car;
import com.sources.mechanicstream.model.Customer;
import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.repository.CarRepository;
import com.sources.mechanicstream.repository.CustomerRepository;
import com.sources.mechanicstream.repository.RepairOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {
    private final CarRepository carRepository;
    private final CustomerRepository customerRepository;
    private final RepairOrderRepository repairOrderRepository;


    private final RepairOrderService repairOrderService;

    @Transactional
    public CarResponse createCar(CreateCarRequest request) {

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Car car = new Car();

        car.setYear(request.year());
        car.setMake(request.make());
        car.setModel(request.model());
        car.setTrim(request.trim());
        car.setVin(request.vin());
        car.setLicensePlate(request.licensePlate());
        car.setMileage(request.mileage());
        car.setColor(request.color());
        car.setCustomer(customer);

        Car saved =  carRepository.save(car);


        return toResponse(saved);
    }
    /** PUT */
    @Transactional
    public CarResponse updateCar(Long carId, UpdateCarRequest request) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found"));
        car.setYear(request.year());
        car.setMake(request.make());
        car.setModel(request.model());
        car.setTrim(request.trim());
        car.setVin(request.vin());
        car.setLicensePlate(request.licensePlate());
        car.setMileage(request.mileage());
        car.setColor(request.color());

        return toResponse(car);
    }

    /** GET */
    public List<CarResponse> getCars(){
        return carRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CarResponse getCarById(Long id){
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        return toResponse(car);
    }

    public List<CarResponse> getCarsByCustomerId(Long customerId){
        if(!customerRepository.existsById(customerId)){
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return carRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();

    }

    /** Delete */
    @Transactional
    public void deleteCar(Long id){
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        List<RepairOrder> repairOrders = repairOrderRepository.findByCarId(car.getId());
        repairOrders.forEach(repairOrder -> {
            repairOrderService.deleteRepairOrder(repairOrder.getId());
        });
        carRepository.delete(car);
    }


    /** Private Mapper */
    private CarResponse toResponse(Car car){
        return new CarResponse(
                car.getId(),
                car.getYear(),
                car.getMake(),
                car.getModel(),
                car.getTrim(),
                car.getVin(),
                car.getLicensePlate(),
                car.getMileage(),
                car.getColor(),
                car.getCustomer().getId()
        );
    }


}
