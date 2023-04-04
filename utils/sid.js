import AsyncStorage from '@react-native-async-storage/async-storage';

const setSID = async (sid) => {
    try {
        await AsyncStorage.setItem('@sid', sid)
    } catch (e) {
        // saving error
    }
}

const getSID = async () => {
    try {
        const sid = await AsyncStorage.getItem('@sid')
        return sid;
    } catch (e) {
        // error reading value
    }
}

module.exports = {
    setSID,
    getSID
}