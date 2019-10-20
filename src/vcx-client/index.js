#!/usr/bin/env node
var vcx = require('node-vcx-wrapper');
var ffi = require('ffi');

async function initializeVcx(libsovtokenPath, vcxConfigPath) {
    console.log('Initializing vcx');

    const myffi = ffi.Library(
        libsovtokenPath,
        {sovtoken_init: ['void', []]}
    );
    await myffi.sovtoken_init();
    await vcx.initVcx(vcxConfigPath);

    console.log('Done');

    return true;
}

module.exports = {
    initializeVcx,
    getConnection: require('./getConnection'),
    ...require('./makeConnection'),
    ...require('./proofRequest')
};