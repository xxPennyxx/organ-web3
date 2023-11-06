// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrganDonation {
    address public admin; // The contract administrator

    struct User {
    address donorAddress;
    string name;
    uint256 aadhaar;
    string[] donate;
    string[] donatedeath;
        }

    struct DeceasedDonor{
        address donorAddress;
        string name;
        string[] donatedeath;
        string details;
        string storagedetails;
    }

    struct AliveDonor{
        address donorAddress;
        string name;
        string[] donate;
        string details;
        string storagedetails;
    }


    User[] public users;
    DeceasedDonor[] public deceasedDonors;
    AliveDonor[] public aliveDonors;



    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the administrator can call this function");
        _;
    }
    event UserRegistered(address userAddress, string name, string email);

    function registerUser
    (
        string memory _name,
        uint256 _aadhaar,
        string[] memory _donate,
        string[] memory _donatedeath
        ) public {
        users.push(User({
            donorAddress: msg.sender,
            name:_name,
            aadhaar:_aadhaar,
            donate:_donate,
            donatedeath:_donatedeath
        }));
    }



    function registerDeceasedDonor
    (
        string memory _name,
        string[] memory _donatedeath,
        string memory _details,
        string memory _storagedetails
        
        ) public {
        deceasedDonors.push(DeceasedDonor({
            donorAddress: msg.sender,
            name:_name,
            donatedeath:_donatedeath,
            details:_details,
            storagedetails:_storagedetails
        }));
    }


    function registerAliveDonor
    (
        string memory _name,
        string[] memory _donate,
        string memory _details,
        string memory _storagedetails
        
        ) public {
        aliveDonors.push(AliveDonor({
            donorAddress: msg.sender,
            name:_name,
            donate:_donate,
            details:_details,
            storagedetails:_storagedetails
        }));
    }


    function getUserData(uint256 index) public view returns (
    address donorAddress,
    string memory name,
    string[] memory donate,
    string[] memory donatedeath
            ) {
    require(index < users.length, "User index out of bounds");

    User memory user = users[index];
    return (
        user.donorAddress,
        user.name,
        user.donate,
        user.donatedeath
    );
    }

    function getDeceasedDonorData(uint256 index) public view returns (
    address donorAddress,
    string memory name,
    string[] memory donatedeath,
    string memory details,
        string memory storagedetails
            ) {
    require(index < users.length, "User index out of bounds");

    DeceasedDonor memory donor = deceasedDonors[index];
    return (
        donor.donorAddress,
        donor.name,
        donor.donatedeath,
        donor.details,
        donor.storagedetails
    );
}

function getAliveDonorData(uint256 index) public view returns (
    address donorAddress,
    string memory name,
    string[] memory donate,
    string memory details,
        string memory storagedetails
            ) {
    require(index < users.length, "User index out of bounds");

    AliveDonor memory donor = aliveDonors[index];
    return (
        donor.donorAddress,
        donor.name,
        donor.donate,
        donor.details,
        donor.storagedetails
    );
}



}
