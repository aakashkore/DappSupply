// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "hardhat/console.sol";

contract SupplyChain {
    enum TransferStatus { IN_TRANSIT, DELIVERED }

    struct Product {
        string name;
        string batch;
        uint256 manufactureDate;
        address currentOwner;
        address[] pastOwners;
        TransferStatus status;
        string ipfsHash;
    }

    mapping(uint256 => Product) public products;
    mapping(string => bool) private uniqueBatches;

    event ProductRegistered(
        uint256 indexed productId,
        string name,
        string batch,
        address indexed manufacturer,
        uint256 manufactureDate,
        string ipfsHash
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed previousOwner,
        address indexed newOwner,
        TransferStatus status
    );

    function registerProduct(
        uint256 productId,
        string memory name,
        string memory batch,
        uint256 manufactureDate,
        string memory ipfsHash

    ) public payable {
        require(products[productId].manufactureDate == 0, "Product already exists");
        require(!uniqueBatches[batch], "Batch already registered");

        uniqueBatches[batch] = true;

        products[productId] = Product({
            name: name,
            batch: batch,
            manufactureDate: manufactureDate,
            currentOwner: msg.sender,
            pastOwners: new address [](0),
             status: TransferStatus.IN_TRANSIT,
             ipfsHash:ipfsHash
        });

        products[productId].pastOwners.push(msg.sender);
        emit ProductRegistered(productId, name, batch, msg.sender, manufactureDate,ipfsHash);
    }

    function transferOwnership(uint256 productId, address newOwner) public payable {
        Product storage product = products[productId];
        require(product.manufactureDate != 0, "Product does not exist");
        require(msg.sender == product.currentOwner, "Caller is not the current owner");
        require(newOwner != address(0), "Invalid new owner address");

        address previousOwner = product.currentOwner;
        product.currentOwner = newOwner;
        product.pastOwners.push(newOwner);

        emit OwnershipTransferred(productId, previousOwner, newOwner, product.status);
    }

    function markAsDelivered(uint256 productId) public {
        Product storage product = products[productId];
        require(product.manufactureDate != 0, "Product does not exist");
        require(msg.sender == product.currentOwner, "Caller is not the current owner");

        product.status = TransferStatus.DELIVERED;

        emit OwnershipTransferred(productId, msg.sender, msg.sender, product.status);
    }

    function getProductDetails(uint256 productId)
        public
        view
        returns (
            string memory name,
            string memory batch,
            uint256 manufactureDate,
            address currentOwner,
            address[] memory pastOwners,
            TransferStatus status,
            string memory ipfsHash
        )
    {
        Product memory product = products[productId];
        require(product.manufactureDate != 0, "Product does not exist");

        return (
            product.name,
            product.batch,
            product.manufactureDate,
            product.currentOwner,
            product.pastOwners,
            product.status,
            product.ipfsHash
        );
    }

    function trackOwnership(uint256 productId) public view returns (address[] memory) {
        Product memory product = products[productId];
        require(product.manufactureDate != 0, "Product does not exist");

        return product.pastOwners;
    }
}
