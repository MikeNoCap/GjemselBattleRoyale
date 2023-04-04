// Import React
import React, { useEffect, useState, useRef } from 'react';
// Import required components
import { SafeAreaView, StyleSheet, View, Text, Image, Animated, Platform } from 'react-native';




// Import Map and Marker
import MapView, { Circle, Marker, Polygon } from 'react-native-maps';


import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

TaskManager.unregisterAllTasksAsync()

import socket from '../utils/socket';
import { getSID } from '../utils/sid'



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

async function startLocationUpdates(handler) {
    // Request foreground location permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
        console.error('Foreground location permission not granted');
        return;
    }

    // Request background location permissions
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
        // Use watchPositionAsync with foreground permissions only
        Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000 },
            location => { handler(location.coords) },
            error => console.error('Location error:', error)
        );
        return;
    }

    console.log('Background location permission granted');
    // Register the background location task
    TaskManager.defineTask("BACKGROUND_LOCATION_TASK", ({ data, error }) => {
        if (error) {
            console.error('Background location task error:', error);
            return;
        }
        if (data) {
            handler(data.locations[0].coords)
        }
    });
    // Start background location updates
    await Location.startLocationUpdatesAsync("BACKGROUND_LOCATION_TASK", {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        showsBackgroundLocationIndicator: true,
    });
}

const game = {
    id: null,
    map: null,
    circle: null,
    players: null
}

export default function Main({ navigation }) {
    const [isAuthed, setIsAuthed] = useState(false)
    useEffect(() => {
        async function sessionAuth() {
            socket.emit("sessionAuth", (await getSID()), (success) => {
                if (!success) {
                    navigation.navigate("Welcome")
                    return
                }
                setIsAuthed(true)
            })
        }
        sessionAuth()
    }, [])
    // Location updates
    useEffect(() => {
        async function handler(locations) {
            const position = {
                latitude: locations.latitude,
                longitude: locations.longitude
            }
            socket.emit("location", position)
        }
        if (isAuthed) {
            socket.on("userJoin", (data) => {
                game.players[data.userData.userId] = data
            })
            socket.emit("joinGame", 0, (newGame) => {
                game.id = newGame.id
                game.map = newGame.map
                game.circle = newGame.circle
                game.players = newGame.players
            })
            startLocationUpdates(handler)
        }

    }, [isAuthed])

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
                        latitude: maps[0].center.latitude,
                        longitude: maps[0].center.longitude,
                        latitudeDelta: 0.06,
                        longitudeDelta: 0.06
                    }}
                    mapType="satellite"
                    minZoomLevel={13}
                >

                </MapView>
            </View>
        </SafeAreaView>
    )
}

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