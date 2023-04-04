import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import socket from '../utils/socket';



export default function ProfilePicture({ navigation }) {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [camera, setCamera] = useState(null);
    const [image, setImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [faceVisible, setFaceVisible] = useState(false)
    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (camera) {
            const data = await camera.takePictureAsync({
                base64: true,
                quality: 0.2
            })
            console.log(data.base64.length)
            setImage(data);
        }
    }
    const retakePicture = async () => {
        setImage(null)
    }
    const confirmPicture = async () => {
        socket.emit("setPfp", { base64: image.base64 }, (status) => {
            if (status.success) {
                navigation.navigate("Main")
            }
            else {
                navigation.navigate("Welcome")
            }

        })
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Ta et kult profilbilde</Text>
            <Text style={styles.subtitle}>(pls ikke vær en taper. vis vennene dine det pene trynet ditt!)</Text>
            <View style={[styles.cameraContainer, {
                borderColor: faceVisible ? "green" : "red"
            }]}>
                {hasCameraPermission ? (
                    !image ? <Camera
                        ref={ref => setCamera(ref)}
                        style={styles.camera}
                        type={Camera.Constants.Type.front}
                        autoFocus={Camera.Constants.AutoFocus.on}
                        ratio={'1:1'}
                        onFacesDetected={(event) => {
                            if (event.faces.length > 0) {
                                setFaceVisible(true)
                                return
                            }
                            setFaceVisible(false)
                        }}
                    /> : <Image source={image} style={{
                        height: 220,
                        width: 220,
                        aspectRatio: 1,
                        borderRadius: 110,
                        transform: [{ scaleX: -1 }]
                    }}></Image>
                ) : 
                <Text>Appen trenger tilgang til kameraet of å ta profilbilde</Text>}
            </View>
            {!image ? <>
                {!faceVisible && <Text style={styles.showFaceText}>Sørg for at hele fjeset ditt er synlig</Text>}
                <TouchableOpacity style={[styles.captureButton, { opacity: faceVisible ? 1 : 0.5 }]} onPress={takePicture} disabled={!faceVisible}>
                    <Text style={styles.captureText}>Ta bilde</Text>
                </TouchableOpacity>
            </> :
                <>
                    <Text style={styles.confirmTextHeader}>Fornøyd?</Text>
                    <View style={styles.confirmContainer}>

                        <TouchableOpacity style={styles.confirmButton} onPress={confirmPicture}>
                            <Text style={styles.confirmText}>JA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                            <Text style={styles.retakeText}>TA IGJEN</Text>
                        </TouchableOpacity>
                    </View>
                </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        position: "absolute",
        top: 100,
        color: "white",
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        position: "absolute",
        top: 155,
        color: "#ccc",
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    cameraContainer: {
        position: 'relative',
        width: 220,
        aspectRatio: 1,
        borderRadius: 110,
        overflow: "hidden",
        borderWidth: 3,
    },
    camera: {
        flex: 1
    },
    captureButton: {
        position: "absolute",
        bottom: 40,
        backgroundColor: '#007bff',
        padding: 20,
        borderRadius: 50,
    },
    captureText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
    },
    showFaceText: {
        color: "yellow",
        position: "absolute",
        bottom: 130
    },

    confirmContainer: {
        position: "absolute",
        bottom: 10,
        width: "95%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"

    },
    confirmTextHeader: {
        position: "absolute",
        color: "white",
        bottom: 95,
        fontSize: 50,
        fontWeight: "bold"
    },

    confirmButton: {
        backgroundColor: "green",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 50,
        textAlign: "center",
        flex: 1,
        marginRight: 4
    },
    confirmText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        textAlign: "center"
    },
    retakeButton: {
        backgroundColor: "red",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 50,
        textAlign: "center",
        flex: 1,
        marginLeft: 4
    },
    retakeText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        textAlign: "center",
    },

    pictureContainer: {
        marginTop: 20,
        borderWidth: 2
    }
})  