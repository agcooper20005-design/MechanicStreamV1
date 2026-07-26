package com.sources.mechanicstream.exception;


import lombok.Getter;

@Getter
public class ErrorResponse {
    private final int status;
    private final String message;
    private final long timeStamp;

    public ErrorResponse(int status, String message){
        this.status = status;
        this.message = message;
        this.timeStamp = System.currentTimeMillis();
    }
}
