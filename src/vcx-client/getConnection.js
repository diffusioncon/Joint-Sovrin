const {Connection} = require('node-vcx-wrapper');
const store = require('./fsDataStore');

async function getConnection(id) {
    let connectionData = await getConnectionData(id);
    if (!connectionData) return null;

    return await Connection.deserialize(connectionData);
}

async function getConnectionData(id) {
    return await store.read('connection', id);
}

module.exports = getConnection;