require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-ignition");
/** @type import('hardhat/config').HardhatUserConfig */
// require("dotenv").config();
// const SEPOLIA_URL = process.env.SEPOLIA_URL || "";
// const PRIVATE_KEY = process.env.PRIVATE_KEY || " ";
module.exports = {
  solidity: "0.8.28",
  networks :{
   hardhat:{
    chainId : 1337 ,
   } ,
   localhost : {
    url: "http://127.0.0.1:8545",
   } ,
  //  sepolia :{
  //   url:SEPOLIA_URL,
  //   accounts: [PRIVATE_KEY],
  //   chainId: 11155111,
  //  },
  // //
    
  }, 
};

