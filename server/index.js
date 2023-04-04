const express = require('express');
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uuid = require('uuid');
const fs = require('fs');

const io = new Server(server, {

})
console.log(process.env.DB_KEY)

const { Pool } = require('pg');
const { stat } = require('fs');

const pool = new Pool({
    host: "localhost",
    user: "gjemsel",
    password: process.env.DB_KEY
});

async function getSessionId(userId) {
    // generate a random UUID
    const random_uuid = uuid.v4();

    // concatenate the user_id and UUID
    const session_id_str = `${userId}${random_uuid}`;

    // hash the session_id_str using SHA-256
    const hashed_session_id = crypto.createHash('sha256').update(session_id_str).digest('hex');

    // the resulting session ID can be stored in a session cookie or database
    const session_id = hashed_session_id;

    // store the session ID in the database for the user
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE users SET session_id = $1 WHERE id = $2', [session_id, userId]);
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    return session_id;
}

async function createUser(username, email, password) {
    const client = await pool.connect();

    let userId;

    try {
        await client.query('BEGIN');

        // Check if email is already in use
        const emailCheckQuery = 'SELECT id FROM users WHERE email = $1';
        const emailCheckValues = [email];
        const emailCheckResult = await client.query(emailCheckQuery, emailCheckValues);

        if (emailCheckResult.rows.length > 0) {
            client.release();
            return { success: false, faultAt: "email", reason: "Email already in use" }
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const queryText = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
        const values = [username, email, hashedPassword];

        const { rows } = await client.query(queryText, values);
        userId = rows[0].id

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }

    client.release();
    const sessionId = await getSessionId(userId)
    return { success: true, sessionId: sessionId, userId: userId }
}

async function authorizeUser(email, password) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if email exists and get the corresponding user's password hash
        const queryText = 'SELECT id, password FROM users WHERE email = $1';
        const values = [email];
        const { rows } = await client.query(queryText, values);

        if (rows.length === 0) {
            client.release();
            return { success: false, faultAt: "password", reason: "Incorrect email or password" }
        }

        const userId = rows[0].id;
        const hashedPassword = rows[0].password;

        // Compare the provided password with the retrieved password hash
        console.log(password, hashedPassword)
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            client.release();
            return { success: false, faultAt: "password", reason: "Incorrect email or password" }
        }

        await client.query('COMMIT');

        client.release();
        const sessionId = await getSessionId(userId);
        return { success: true, userId: userId, sessionId: sessionId };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

function getUserProfilePicture(userId) {
    try {
        // Construct the filename for the user's profile picture.
        const filename = `public/profilepictures/${userId}_pfp.jpg`;

        // Read the file containing the image data.
        const imageData = fs.readFileSync(filename);

        // Convert the image data to a base64 string.
        const base64Data = imageData.toString('base64');

        return base64Data;
    } catch (err) {
        console.error(`Error getting profile picture for user ${userId}:`, err);
        return null;
    }
}
async function getUserInfo(userId) {
    const client = await pool.connect();

    try {
        const queryText = 'SELECT email, username FROM users WHERE id = $1';
        const values = [userId];
        const { rows } = await client.query(queryText, values);

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        return {
            email: rows[0].email,
            username: rows[0].username
        };

    } finally {
        client.release();
    }
}



async function sessionAuth(sessionId) {
    try {
        // Acquire a client from the connection pool
        const client = await pool.connect();

        // Query the users table to get the user ID associated with the session ID
        const userQuery = 'SELECT id FROM users WHERE session_id = $1';
        const userValues = [sessionId];
        const userResult = await client.query(userQuery, userValues);

        // If the session ID is not found, return false
        if (userResult.rowCount === 0) {
            client.release()
            return { success: false };
        }

        // If the session ID is valid, return true and the user ID
        const userId = userResult.rows[0].id;
        return { success: true, userId: userId };
    } catch (error) {
        console.error('Error during session authentication:', error);
        client.release()
        return { success: false };
    }
}


async function joinGame(userId, gameId) {
    const userInfo = await getUserInfo(userId)
    const userPfp = getUserProfilePicture(userId)
    const userData = {
        ...userInfo,
        userId: userId,
        pfp: userPfp,
    };
    games[gameId].players[userId] = {
        userData: userData,
        location: {
            longitude: 0,
            latitude: 0
        }
    }
    return games[gameId]
}



const maps = {
    "Heggedal": {
        center: {
            latitude: 59.78477198225559,
            longitude: 10.454697800613803
        },
        radius: 1400
    }
}
const games = [
    {
        id: 0,
        map: maps.Heggedal,
        circle: {
            storm: {
                centerCoords: [10.59231, 12.4140],
                radius: 1400
            },
            newZone: {
                centerCoords: [10.59131, 12.4140],
                radius: 1200
            }
        },
        players: {

        }

    }
]
const socketUsers = {};
const userGames = {};

io.on("connection", (socket) => {
    socket.on("joinGame", async (gameId, callback) => {
        const userId = socketUsers[socket.id]
        if (!userId) {
            return
        } 
        const game = await joinGame(userId, gameId)
        console.log(game)
        userGames[userId] = game.id
        socket.join(game.id)
        socket.to(game.id).emit("userJoin", game.players[userId])
        callback(game)
        console.log((await getUserInfo(userId)).email, " has joined game")
    })
    socket.on("sessionAuth", async (sessionId, callback) => {
        const status = await sessionAuth(sessionId)
        if (status.success) {
            socketUsers[`${socket.id}`] = status.userId
            console.log((await getUserInfo(status.userId)).email, "has logged on! (sessionId auth)")
            return callback(true)
        }
        callback(false)
    })
    socket.on("signup", async (data, callback) => {
        const status = await createUser(data.username, data.email, data.password);
        if (status.success) {
            socketUsers[`${socket.id}`] = status.userId
            console.log((await getUserInfo(status.userId)).email, "has logged on! (signed up)")
        }
        callback(status)
    })
    socket.on("setPfp", async (data, callback) => {
        if (!socketUsers[socket.id]) {
            callback({ success: false, status: 403 })
        }
        // Generate a unique filename for the image.
        const filename = `public/profilepictures/${socketUsers[socket.id]}_pfp.jpg`;

        // Write the image data to a file.
        fs.writeFile(filename, data.base64, 'base64', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            callback({ success: true })
        });

    })
    socket.on("signin", async (data, callback) => {
        const status = await authorizeUser(data.email, data.password)
        if (status.success) {
            socketUsers[`${socket.id}`] = status.userId
            console.log((await getUserInfo(status.userId)).email, "has logged on! (logged in)")
        }
        callback(status)
    })
    
    socket.on("location", (data) => {
        const userId = socketUsers[socket.id]
        if (!userId) {
            return
        }
        games[userGames[userId]].players[userId].location = data
        socket.to(userGames[userId]).emit("updatePlayerLocation", data)
        
    });
});



server.listen(3000, () => {
    console.log("Listening on port 3000")
})