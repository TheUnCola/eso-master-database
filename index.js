let helper = require('./helper.js'),
    firebase = require('./firebase.js'),
    fs = require('fs');

let getAndUpdateData = async function() {
    let exports = await helper.readExport('../../SavedVariables/DepositExporter.lua');

    let entries = helper.checkForDuplicates(exports,await firebase.getDeposits());
    console.log(JSON.stringify(entries, null, 2));

    if(Object.keys(entries).length > 0) await firebase.updateDB(entries);
};

fs.watchFile('../../SavedVariables/DepositExporter.lua', (curr, prev) => {
    console.log('A change was made to DepositExporter');
    getAndUpdateData();
});
