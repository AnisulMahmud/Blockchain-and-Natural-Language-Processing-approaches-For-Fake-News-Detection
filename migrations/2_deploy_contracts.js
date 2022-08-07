var NewsDetection = artifacts.require("./newsDetection.sol");

module.exports = function(deployer) {
  deployer.deploy(NewsDetection);
};
