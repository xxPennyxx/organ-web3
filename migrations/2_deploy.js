const OrganDonation = artifacts.require("OrganDonation");

module.exports = function(deployer) {
  deployer.deploy(OrganDonation).then(async (instance) => {
    console.log("Contract Address:", instance.address);
    const abi = instance.abi;
    console.log("Contract ABI:");
    console.log(abi, null, 2);
  });
};
