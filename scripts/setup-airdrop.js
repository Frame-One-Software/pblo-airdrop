// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// CSV PARSER
const fs = require('fs').promises; 
const csv = require('async-csv');
const _ = require('underscore');

async function main() {
    //
    let accounts = await hre.ethers.getSigners();

    // let seller = accounts[0];
    // let user1 = accounts[1];
    let pblo_token_owner = accounts[2];            // OWNER :: 0xA2CE1dd4C433BC416e5908Fcd9a96288e0A26D0b

    // Read file from disk:
    const csvString = await fs.readFile(__dirname+'/pbt-holder.csv', 'utf-8');      
 
    // Convert CSV string into rows:
    const rows = await csv.parse(csvString);
    rows.shift();           // <!--- Remove first row ("HolderAddress","Balance","PendingBalanceUpdate") -->
    
    //
    let addresses = rows.map(_holders => _holders[0]);
    let amounts = rows.map(_holders => BigInt(_holders[1]).toString());

    // <!-- Prepare batches -->
    let addressBatches = _.chunk(addresses, 170);
    let amountBatches = _.chunk(amounts, 170);

    for (const address of addressBatches) {
        //
        let _index = addressBatches.indexOf(address);

        // Interect with PBLOToken
        // const PBLOTokenModel = await hre.ethers.getContractFactory("PBLOToken");
        // const PBLOTokenSub = await PBLOTokenModel.attach("0x1909428e9e70D8A09fA08AA9ec657674AB19c4b0");
        // const PBLOToken = await PBLOTokenSub.connect(pblo_token_owner);                // OWNER WALLET ADDRESS

        // let balance = await PBLOToken.balanceOf("0xA2CE1dd4C433BC416e5908Fcd9a96288e0A26D0b");
        // console.log("BALANCE ", balance.toString());

        // let _index = addressBatches.indexOf(address);
        // console.log("ADDRESS", _index );
        
        const PBLOTokenAirdropModel = await hre.ethers.getContractFactory("PBLOAirdrop");
        const PBLOTokenAirdropSub = await PBLOTokenAirdropModel.attach("0xE71bbd7cE973002D6BaFa1Ee9B90d03C4811A57c");
        const PBLOTokenAirdrop = await PBLOTokenAirdropSub.connect(pblo_token_owner);                // OWNER WALLET ADDRESS

        const amount = amountBatches[_index];
        await PBLOTokenAirdrop.multiERC20Transfer(address, amount);

    }

}

// Begin Airdropping Process
main()
.then(() => process.exit(0))
.catch(error => {
console.error(error);
process.exit(1);
});
