import React, { memo, useEffect, useState } from 'react';
import MapView, { Circle, Polygon } from 'react-native-maps';

const SIDE_LENGTH = 6000000; // meters


export function getPolygonSquare(center) {
    const LATITUDE = center.latitude
    const LONGITUDE = center.longitude
    // Calculate the distance (in degrees) for one side of the square in the latitude and longitude dimensions
    const LATITUDE_DELTA = SIDE_LENGTH / (111.32 * 1000); // 1 degree of latitude is approximately 111.32 km
    const LONGITUDE_DELTA = SIDE_LENGTH / (111.32 * 1000 * Math.cos(LATITUDE * (Math.PI / 180)));

    const squareCoordinates = [
        {
            latitude: LATITUDE - LATITUDE_DELTA / 2,
            longitude: LONGITUDE - LONGITUDE_DELTA / 2,
        },
        {
            latitude: LATITUDE - LATITUDE_DELTA / 2,
            longitude: LONGITUDE + LONGITUDE_DELTA / 2,
        },
        {
            latitude: LATITUDE + LATITUDE_DELTA / 2,
            longitude: LONGITUDE + LONGITUDE_DELTA / 2,
        },
        {
            latitude: LATITUDE + LATITUDE_DELTA / 2,
            longitude: LONGITUDE - LONGITUDE_DELTA / 2,
        },
    ];
    return squareCoordinates
}
export function getPolygonCircleHole(center, radius) {
    console.log("Radius is nan?", isNaN(radius))
    const circleHoleCenter = center;

    const circleHoleRadius = radius;
    const circleHolePoints = 50;

    const circleHoleCoordinates = [];
    for (let i = 0; i < circleHolePoints; i++) {
        const angle = (Math.PI * 2 * i) / circleHolePoints;
        const x = circleHoleRadius * Math.cos(angle);
        const y = circleHoleRadius * Math.sin(angle);

        const latitude = circleHoleCenter.latitude + y / (111.32 * 1000);
        const longitude =
            circleHoleCenter.longitude + (x / (111.32 * 1000 * Math.cos(circleHoleCenter.latitude * (Math.PI / 180))));

        circleHoleCoordinates.push({
            latitude,
            longitude,
        });
    }
    console.log([circleHoleCoordinates])
    return [circleHoleCoordinates]
}

