const {  loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain Contract", function () {
    let supplyChain, owner, addr1, addr2;

    beforeEach(async function () {
        const SupplyChain = await ethers.getContractFactory("SupplyChain");
        supplyChain = await SupplyChain.deploy();
        [owner, addr1, addr2] = await ethers.getSigners();
    });

    it("Should register a product", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);

        const product = await supplyChain.getProductDetails(1);
        expect(product.name).to.equal("ProductA");
        expect(product.batch).to.equal("Batch001");
        expect(product.currentOwner).to.equal(owner.address);

        const ownershipHistory = await supplyChain.trackOwnership(1);
        expect(ownershipHistory).to.deep.equal([owner.address]);
    });

    it("Should not allow duplicate product registration", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);
        await expect(
            supplyChain.registerProduct(1, "ProductB", "Batch002", 1690387200)
        ).to.be.revertedWith("Product already exists");
    });

    it("Should transfer ownership and update ownership history", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);

        await supplyChain.transferOwnership(1, addr1.address);
        const product = await supplyChain.getProductDetails(1);
        expect(product.currentOwner).to.equal(addr1.address);

        const ownershipHistory = await supplyChain.trackOwnership(1);
        expect(ownershipHistory).to.deep.equal([owner.address, addr1.address]);

        await supplyChain.connect(addr1).transferOwnership(1,addr2.address);
        const updatedOwnershipHistory = await supplyChain.trackOwnership(1);
        expect(updatedOwnershipHistory).to.deep.equal([owner.address, addr1.address, addr2.address]);
    });

    it("Should mark product as delivered", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);
        await supplyChain.markAsDelivered(1);

        const product = await supplyChain.getProductDetails(1);
        expect(product.status).to.equal(1); // 1 is DELIVERED

        const ownershipHistory = await supplyChain.trackOwnership(1);
        expect(ownershipHistory).to.deep.equal([owner.address]);
    });

    it("Should revert if non-owner tries to transfer ownership", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);
        await expect(
            supplyChain.connect(addr1).transferOwnership(1, addr2.address)
        ).to.be.revertedWith("Caller is not the current owner");
    });

    it("Should revert if non-owner tries to mark as delivered", async function () {
        await supplyChain.registerProduct(1, "ProductA", "Batch001", 1690387200);
        await expect(
            supplyChain.connect(addr1).markAsDelivered(1)
        ).to.be.revertedWith("Caller is not the current owner");
    });
});

