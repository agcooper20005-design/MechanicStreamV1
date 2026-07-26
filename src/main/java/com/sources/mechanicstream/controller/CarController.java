package com.sources.mechanicstream.controller;


import com.sources.mechanicstream.dto.car.CarResponse;
import com.sources.mechanicstream.dto.car.CreateCarRequest;
import com.sources.mechanicstream.dto.car.UpdateCarRequest;
import com.sources.mechanicstream.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CarController {
    private final CarService carService;

    /** POST */
    @PostMapping("/cars")
    public CarResponse createCar(@Valid @RequestBody CreateCarRequest request) {
        return carService.createCar(request);
    }

    /** PUT */
    @PutMapping("/cars/{carId}")
    public CarResponse updateCar(@PathVariable Long carId, @Valid @RequestBody UpdateCarRequest request) {
        return carService.updateCar(carId,request);
    }

    /** GET */
    @GetMapping("/cars")
    public List<CarResponse> getCars() {
        return carService.getCars();
    }

    @GetMapping("/cars/{carId}")
    public CarResponse getCar(@PathVariable Long carId) {
        return carService.getCarById(carId);
    }

    @GetMapping("/customers/{customerId}/cars")
    public List<CarResponse> getCarsByCustomerId(@PathVariable Long customerId) {

        return carService.getCarsByCustomerId(customerId);
    }

    /** DELETE */
    @DeleteMapping("/cars/{carId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCar(@PathVariable Long carId) {
        carService.deleteCar(carId);
    }

}
