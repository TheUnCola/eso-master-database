let helper = require('./helper.js'),
    firebase = require('./firebase.js'),
    fs = require('fs');

let getAndUpdateData = async function() {
    let exports = await helper.readExport('../../SavedVariables/DepositExporter.lua');
    let dbRecords = await firebase.getDeposits();
    let dupCheck = helper.checkForDuplicates(exports,dbRecords);
    let entries = dupCheck.entries, duplicates = dupCheck.duplicates;
    //console.log(JSON.stringify(entries, null, 2));

    helper.logOutput(dbRecords, exports, entries, duplicates);

    if(Object.keys(entries).length > 0) await firebase.updateDB(entries);
};

let updateBank = async function() {
    let entries = await helper.readBankExport('../../SavedVariables/GuildDataDump.lua');

    console.log(JSON.stringify(entries, null, 2));
    if(Object.keys(entries).length > 0) await firebase.deleteBankDB();
    if(Object.keys(entries).length > 0) await firebase.updateDB(entries);
};

fs.watchFile('../../SavedVariables/DepositExporter.lua', (curr, prev) => {
    console.log('A change was made to DepositExporter');
    getAndUpdateData();
});

fs.watchFile('../../SavedVariables/GuildDataDump.lua', (curr, prev) => {
    console.log('A change was made to GuildDataDump');
    updateBank();
});