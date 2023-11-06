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

    function getUserData(uint256 index) public view returns (
    address donorAddress,
    string memory name,
    uint256 aadhaar,
    string[] memory donate,
    string[] memory donatedeath
) {
    require(index < users.length, "User index out of bounds");

    User memory user = users[index];
    return (
        user.donorAddress,
        user.name,
        user.aadhaar,
        user.donate,
        user.donatedeath
    );
}


}
