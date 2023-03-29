import React, { useEffect, useState } from 'react';
import MapView, { Circle } from 'react-native-maps';


export default function NewCircle(props) {
    return (
        <Circle
            center={props.circle.center}
            radius={props.circle.radius}
            strokeWidth={4}
            zIndex={2}
            fillColor={"transparent"}
            strokeColor={"white"} />
    )
}