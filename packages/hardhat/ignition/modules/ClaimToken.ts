import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClaimTokenModule = buildModule("ClaimTokenModule", (m) => {
  const deployer = m.getAccount(0);
  
  const claimToken = m.contract("ClaimToken", [
    "ClaimToken", // name
    "CLAIM",      // symbol
    deployer      // initialOwner
  ]);

  return { claimToken };
});

export default ClaimTokenModule; 