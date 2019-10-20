const vcx = require('node-vcx-wrapper');
const qr = require('qr-image');

const {
    Connection,
    StateType
} =  vcx;

const store = require('./fsDataStore');

async function makeConnection(type, id, phone) {
    let connection = await Connection.create({
        id
    });

    let connectionData = JSON.stringify({
        id,
        connection_type: type
    });

    await connection.connect({
        data: connectionData
    });

    return connection;
}

async function getInviteQrCode(connection) {
    return qr.image(
        await connection.inviteDetails(true),
        {type: 'png'}
    );
}

async function waitForConnection(connection) {
    let state = await connection.getState();
    let timer = 0;
    // set up loop to poll for a response or a timeout if there is no response
    while(state !== StateType.Accepted && timer < 1250) {
        console.log("The State of the Connection is "+ state + " "+timer);
        await connection.updateState();
        state = await connection.getState();
        timer+=1;
    }
}

async function saveConnection(connectionId, connection) {
    await store.write(
        'connection',
        connectionId,
        await connection.serialize()
    );
}

module.exports = {
    makeConnection,
    getInviteQrCode,
    waitForConnection,
    saveConnection
};