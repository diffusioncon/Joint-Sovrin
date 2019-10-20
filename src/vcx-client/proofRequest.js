const {
    Proof,
    StateType
} = require('node-vcx-wrapper');

async function proofRequest(connection, request) {
    const proof = await sendProofRequest(connection, request);
    await waitForProofBeingAccepted(proof);
    return await processAcceptedProof(proof, connection);
}

async function sendProofRequest(connection, request) {
    await connection.updateState();
    await connection.serialize();

    let proof = await Proof.create(request);
    await proof.requestProof(connection);
    await proof.updateState();

    return proof;
}

async function waitForProofRequestBeingAccepted(proof) {
    let state = await proof.getState();

    while (state !== StateType.Accepted) {
        console.log(`Proof request state is ${state}`);
        await proof.updateState();
        state = await proof.getState();
    }
}

async function processAcceptedProof(proof, connection) {
    const proofResult = await proof.getProof(connection);
    const proofData = await proof.serialize();
    const proofState = proofResult.proofState;

    console.log(proofData);

    const proofAttrs = JSON.parse(
        proofData.data.proof.libindy_proof
    );

    return proofAttrs;
}

module.exports = {
    sendProofRequest,
    waitForProofRequestBeingAccepted,
    processAcceptedProof
};