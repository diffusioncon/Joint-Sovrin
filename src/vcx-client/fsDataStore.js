const fs = require('fs-extra');
const {DATA_PATH} = require('../config');

function getFilePath(type, id) {
    return `${DATA_PATH}/${type}.${id}.json`;
}

async function read(type, id) {
    const dataFilePath = getFilePath(type, id);
    if (!await fs.exists(dataFilePath)) return null;
    console.log(`Reading ${dataFilePath}`);
    return await fs.readJson(dataFilePath);
}

async function write(type, id, data) {
    const dataFilePath = getFilePath(type, id);
    console.log(`Saving ${type} in ${dataFilePath}`);
    await fs.writeJson(dataFilePath, data);
}

module.exports = {
    read,
    write
};