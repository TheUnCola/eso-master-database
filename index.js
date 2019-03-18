let helper = require('./helper.js'),
    firebase = require('./firebase.js');

let getAndUpdateData = async function() {
    let exports = await helper.readExport('DepositExporter.lua');

    let entries = helper.checkForDuplicates(exports,await firebase.getDeposits());
    console.log(JSON.stringify(entries, null, 2));

    if(Object.keys(entries).length > 0) await firebase.updateDB(entries);
}

getAndUpdateData();