// Import React
import React, { useEffect, useState, useRef } from 'react';
// Import required components
import { SafeAreaView, StyleSheet, View, Text, Image, Animated } from 'react-native';




// Import Map and Marker
import MapView, { Circle as CircleMap, Marker, Polygon } from 'react-native-maps';

import StormCircle from './components/StormCircle';
const AnimatedStormCircle = Animated.createAnimatedComponent(StormCircle)
import NewCircle from './components/NewCircle';


import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';




const maps = [
  {
    name: "Heggedal",
    center: {
      latitude: 59.78477198225559,
      longitude: 10.454697800613803
    },
    radius: 1400
  }
]
const map = maps[0]






const pfp = require("./pfp.jpg")




async function requestPermissions() {
  var { status } = await Location.requestForegroundPermissionsAsync();
  console.log(status)
  var { status } = await Location.requestBackgroundPermissionsAsync();
  console.log(status)
}

requestPermissions()



const App = () => {
  const [location, setLocation] = useState(null)
  const [heading, setHeading] = useState(0)



  const radiusAnimationRef = useRef(new Animated.Value(1400)).current
  const centerAnimationRef = useRef(new Animated.ValueXY({ x: map.center.longitude, y: map.center.latitude })).current

  useEffect(() => {
      Animated.timing(radiusAnimationRef, {
        toValue: 1000,
        duration: 10000*6+2000,
        useNativeDriver: false
      }).start()
      Animated.timing(centerAnimationRef, {
        toValue: { x: 10.456697800613803, y: 59.78777198225559, },
        duration: 10000*6,
        useNativeDriver: false
      }).start()



  }, [radiusAnimationRef])
  useEffect(() => {
    async function getLocation() {
      TaskManager.defineTask("locationTask", ({ data: { locations }, error }) => {
        if (error) {
          // check `error.message` for more details.
          return;
        }
        console.log('Received new locations', locations);
        setLocation(locations[0])
      });
      await Location.startLocationUpdatesAsync("locationTask", {
        distanceInterval: 0,
        timeInterval: 5000,
        accuracy: Location.Accuracy.BestForNavigation
      })
    }
    getLocation()

  }, [])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView.Animated
          style={styles.mapStyle}
          customMapStyle={mapStyle}

          provider="google"
          showsCompass={false}
          toolbarEnabled={false}
          region={{
            latitude: maps[0].center.latitude,
            longitude: maps[0].center.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06
          }}
          mapType="satellite"
          minZoomLevel={13}
        >
          <AnimatedStormCircle
            x={centerAnimationRef.x}
            y={centerAnimationRef.y}
            radius={radiusAnimationRef} />

          <NewCircle circle={{
            center: {
              latitude: 59.78777198225559,
              longitude: 10.456697800613803
            }, radius: 1000
          }} />


          {location != null &&
            <Marker
              flat={true}
              rotation={0}
              pinColor={"gold"}
              coordinate={
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                }}
            >
              <View
                style={
                  {
                    backgroundColor: "red",
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 0,
                    padding: 0
                  }}>
                <Image style={{ height: 35, width: 35, borderRadius: 17.5 }} source={pfp}></Image>

              </View>
            </Marker>}

        </MapView.Animated>
      </View>
    </SafeAreaView>
  );
};
export default App;
const mapStyle = [
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
];
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});