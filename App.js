// Import React
import React, { useEffect, useState } from 'react';
// Import required components
import { SafeAreaView, StyleSheet, View, Text, Image } from 'react-native';
// Import Map and Marker
import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';


const pfp = require("./pfp.jpg")



async function a() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  console.log(status)
}

a()



const App = () => {
  const [location, setLocation] = useState(null)
  const [heading, setHeading] = useState(0)
  useEffect(() => {
    async function getLocation() {
      let location = await Location.getCurrentPositionAsync({})
      let heading = await Location.getHeadingAsync({})
      console.log(heading)
      console.log(location)
      setHeading(heading)
      setLocation(location)
    }
    getLocation()

  }, [])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          mapType="satellite"
          customMapStyle={mapStyle}
        >
          {location != null &&
            <Marker
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
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                <View></View>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={pfp}></Image>
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