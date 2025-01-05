const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("SupplyChain",(m) => {
    const intialProductID = m.getParameter("initialProductID" , 1);
    const supplyChain = m.contract("SupplyChain");

    return{supplyChain};
});