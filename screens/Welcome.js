import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';

import socket from "../utils/socket"
import { setSID, getSID } from "../utils/sid"

// Email validation with additional checks
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, reason: "Please enter a valid email address." };
    }
    const [localPart, domainPart] = email.split('@');
    if (localPart.length > 64) {
        return { isValid: false, reason: "Email local part is too long." };
    }
    if (domainPart.length > 255) {
        return { isValid: false, reason: "Email domain is too long." };
    }
    if (email.length > 254) {
        return { isValid: false, reason: "Email is too long." };
    }
    return { isValid: true };
}

// Username validation with additional checks
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!username) {
        return { isValid: false, reason: "Please enter a username." };
    }
    if (username.length < 3) {
        return { isValid: false, reason: "Username should be at least 3 characters." };
    }
    if (username.length > 50) {
        return { isValid: false, reason: "Username is too long." };
    }
    if (!usernameRegex.test(username)) {
        return { isValid: false, reason: "Username contains invalid characters." };
    }
    return { isValid: true };
}


function validatePassword(password, confirmPassword) {
    if (password.length == 0) {
        return { isValid: false, reason: "Please create a password." };
    }
    if (password.length < 8) {
        return { isValid: false, reason: "Password should be at least 8 characters." };
    }
    if (password.length > 72) {
        return { isValid: false, reason: "Password is too long." };
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return { isValid: false, reason: "Password should contain at least one capital letter and one number." };
    }
    if (password.toLowerCase().includes(' ')) {
        return { isValid: false, reason: "Password should not contain any spaces." };
    }
    if (!confirmPassword || confirmPassword !== password) {
        return { isValid: false, reason: "Passwords do not match." };
    }
    return { isValid: true };
}





export default function Welcome({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignIn, setIsSignIn] = useState(false);


    const [invalidEmail, setInvalidEmail] = useState(false)
    const [invalidName, setInvalidName] = useState(false)
    const [invalidPassword, setInvalidPassword] = useState(false)

    const handleSignIn = () => {
        const cleanedEmail = email.replace(/\s+/g, ' ').trim();
        const cleanedPassword = password.replace(/\s+/g, ' ').trim();
        socket.emit("signin", {email: cleanedEmail, password: cleanedPassword}, (data) => {
            if (data.success) {
                setSID(data.sessionId)
                navigation.navigate("Main")
                return
            }
            if (data.faultAt === "password") {
                setInvalidPassword(data.reason)
            }
        })
    };

    const handleSignUp = () => {
        setInvalidEmail(false)
        setInvalidName(false)
        setInvalidPassword(false)

        let passed = true

        const emailCheck = validateEmail(email)
        if (!emailCheck.isValid) {
            setInvalidEmail(emailCheck.reason)
            passed = false
        }

        const nameCheck = validateUsername(username)
        if (!nameCheck.isValid) {
            setInvalidName(nameCheck.reason)
            passed = false
        }

        const passwordCheck = validatePassword(password, confirmPassword)
        if (!passwordCheck.isValid) {
            setInvalidPassword(passwordCheck.reason)
            passed = false
        }

        if (!passed) {
            return
        }

        const cleanedEmail = email.replace(/\s+/g, ' ').trim();
        const cleanedUsername = username.replace(/\s+/g, ' ').trim();


        console.log("SIGN UP WITH", cleanedEmail, cleanedUsername, password)
        socket.emit("signup", { email: cleanedEmail, username: cleanedUsername, password: password }, (data) => {
            if (data.success) {
                setSID(data.sessionId)
                navigation.navigate("ProfilePicture")
                return
            }
            if (data.faultAt === "email") {
                setInvalidEmail(data.reason)
            }
        })
    };

    const toggleSignIn = () => {
        setInvalidEmail(false)
        setInvalidName(false),
            setInvalidPassword(false),

            setUsername("")
        setConfirmPassword("")

        setIsSignIn(!isSignIn);
    };




    return (
        <KeyboardAvoidingView style={styles.container}>
            <Text style={styles.title}>
                {isSignIn
                    ? 'Velkommen tilbake!'
                    : 'Velkommen til GjemselRoyale!'}</Text>
            <Text style={styles.subtitle}>
                {isSignIn
                    ? 'Log inn for mer GjemselRoyale'
                    : 'Storartet gøy venter, men først må du lage en bruker'}
            </Text>


            {invalidEmail && <Text style={styles.error}>{invalidEmail}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />


            {!isSignIn &&
                <>
                    {invalidName && <Text style={styles.error}>{invalidName}</Text>}
                    <TextInput
                        style={styles.input}
                        placeholder="Fornavn"
                        value={username}
                        onChangeText={setUsername}
                    />
                </>
            }


            {invalidPassword && <Text style={styles.error}>{invalidPassword}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Passord"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />


            {!isSignIn &&
                <TextInput
                    style={styles.input}
                    placeholder="Bekreft passord"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />}

            {isSignIn ? (
                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Log inn</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Oprett bruker</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleSignIn}>
                <Text style={styles.toggleText}>
                    {isSignIn
                        ? "Har du ikke en bruker? Opprett bruker"
                        : 'Har du allerede en bruker? Log inn'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 32,
        textAlign: 'center',
        width: "70%",

    },
    input: {
        height: 40,
        width: '80%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    button: {
        height: 40,
        width: '80%',
        backgroundColor: '#007bff',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleText: {
        color: '#007bff',
        textDecorationLine: 'underline',
        marginTop: 16
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginBottom: 5
    }
});
