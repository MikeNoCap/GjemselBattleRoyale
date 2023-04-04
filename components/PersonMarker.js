import React from 'react'

export default function PersonMarker(props) {
  return (
    <Marker
      flat={true}
      rotation={0}
      coordinate={
        {
          latitude: props.latitude,
          longitude: props.longitude
        }}
    >
      <View
        style={
          {
            backgroundColor: props.color,
            height: 40,
            width: 40,
            borderRadius: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: 0,
            padding: 0
          }}>
        <Image style={{ height: 35, width: 35, borderRadius: 17.5 }} source={props.pfp}></Image>

      </View>
    </Marker>
  )
}