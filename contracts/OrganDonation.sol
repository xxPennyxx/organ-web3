// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrganDonation {
    address public admin; // The contract administrator

    struct User {
    address donorAddress;
    string[] donate;
    string[] donatedeath;
}
    User[] public users;

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
        
        string[] memory _donate,
        string[] memory _donatedeath
        ) public {
        users.push(User({
            donorAddress: msg.sender,
            donate:_donate,
            donatedeath:_donatedeath
        }));
    }

    function getUserData(uint256 index) public view returns (
    address donorAddress,
    string[] memory donate,
    string[] memory donatedeath
) {
    require(index < users.length, "User index out of bounds");

    User memory user = users[index];
    return (
        user.donorAddress,
        user.donate,
        user.donatedeath
    );
}





}
