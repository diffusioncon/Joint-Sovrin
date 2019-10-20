const vcx = require('node-vcx-wrapper/dist');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(session({secret: "Secret Key"}));
app.use(bodyParser.urlencoded({ extended: false }));
// app settings for json, url, cors, and a public folder for shared use
app.use(express.json());
// express use url encoded for post messages
app.use(express.urlencoded());
// express set up Cross Origin
app.use(cors());

const server = require('http').Server(app);
const io = require('socket.io')(server);

const {
    PORT,
    VCX_CONFIG_PATH,
    LIBSOVTOKEN_PATH
} = require('./config');

const {
    initializeVcx,
    makeConnection,
    getInviteQrCode,
    waitForConnection,
    saveConnection,
    getConnection,
    sendProofRequest,
    waitForProofRequestBeingAccepted,
    processAcceptedProof
} = require('./vcx-client');

app.get('/', (req, res) => res.send('hello vcx'));

app.get('/api/connect', async (req, res) => {
    const connectionId = req.query.id;
    const connection = await makeConnection('QR', connectionId);
    const qrCode = await getInviteQrCode(connection);
    qrCode.pipe(res);
    await waitForConnection(connection);
    await saveConnection(connectionId, connection);
});

app.post('/api/proof', async (req, res) => {
    const connectionId = req.body.id;
    const proofId = 'proof-request';
    const connection = await getConnection(connectionId);

    if (!connection) {
        console.log('Cant reestablish connection with ' + connectionId);
        io.emit('proofException');
        res.end();
        return;
    }

    let requestFields = req.body.fields;
    let proofName = req.body.name;

    let proofRequest = {
        attrs: requestFields.map(name => ({name})),
        sourceId: proofId,
        name: proofName,
        revocationInterval: {}
    };

    console.log('Sending proof request');
    io.emit('proofRequest');
    const proof = await sendProofRequest(connection, proofRequest);

    io.emit('proofWaiting');
    console.log('Waiting for user to accept request');
    await waitForProofRequestBeingAccepted(proof);

    console.log('Processing accepted proof request');
    const data = await processAcceptedProof(proof, connection);

    let response = {};
    data.forEach(field => response[field.name] = field.raw);

    io.emit('proofResult', response);
    console.log(response);
});

initializeVcx(LIBSOVTOKEN_PATH, VCX_CONFIG_PATH).then(() => {
    io.on('connection',socket=>{
        console.log("a user connected");
        socket.on('disconnect',()=>{
            console.log("user disconnected");
        });
        socket.on('message',function(data){
            console.log(data);
        })
    });

    server.listen(PORT, () => {
        console.log(`Vcx client listening on port ${PORT}`)
    });
}).catch(e => {
    console.log(e);
});