// Import React
import React, { useEffect, useState } from 'react';
// Import required components
import { SafeAreaView, StyleSheet, View, Text, Image } from 'react-native';
// Import Map and Marker
import MapView, { Circle, Marker } from 'react-native-maps';

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';





const pfp = require("./pfp.jpg")



async function a() {
  var { status } = await Location.requestForegroundPermissionsAsync();
  console.log(status)
  var { status } = await Location.requestBackgroundPermissionsAsync();
  console.log(status)
}

a()



const App = () => {
  const [location, setLocation] = useState(null)
  const [heading, setHeading] = useState(0)
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
       await Location.startLocationUpdatesAsync("locationTask")
    }
    getLocation()

  }, [])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          customMapStyle={mapStyle}

          provider="google"
          showsCompass={false}
          toolbarEnabled={false}
          region={{
            latitude: 59.78477198225559,
            longitude: 10.454697800613803,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06
          }}
          minZoomLevel={13}
          mapType="satellite"
        >
          <Circle
          center={{
            latitude: 59.78477198225559,
            longitude: 10.454697800613803

          }}
          radius={1400}
          strokeWidth={4}
          strokeColor={"white"}></Circle>
        
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

        </MapView>
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