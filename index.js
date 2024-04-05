import { providers, Wallet } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { gasPriceToGwei } from "./utils.js";

import "log-timestamp";
import "dotenv/config";


const provider = new providers.JsonRpcProvider("https://go.getblock.io/4120bbddeff841b5aed724e871594278");
const walletZeroGas = new Wallet("ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258", provider);

console.log(`Zero Gas Account: ${walletZeroGas.address}`);

async function burn(wallet) {
  const balance = await wallet.getBalance();
  if (balance.isZero()) {
    console.log(` Balance is zero`);
    return;
  }

  const gasPrice = balance.div(21000).sub(1);
  if (gasPrice.lt(1e9)) {
    console.log(
      ` Balance too low to burn (balance=${formatEther(
        balance
      )} gasPrice=${gasPriceToGwei(gasPrice)})`
    );
    return;
  }

  try {
    console.log(` Burning ${formatEther(balance)}`);
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      gasLimit: 21000,
      gasPrice,
    });
    console.log(
      ` Sent tx with nonce ${tx.nonce} burning ${formatEther(
        balance
      )} ETH at gas price ${gasPriceToGwei(gasPrice)} gwei: ${tx.hash}`
    );
  } catch (err) {
    console.log(` Error sending tx: ${err.message ?? err}`);
  }
}

async function main() {
  console.log(`Connected to ${"https://go.getblock.io/4120bbddeff841b5aed724e871594278"}`);
  provider.on("block", async (blockNumber) => {
    console.log(`New block ${blockNumber}`);
    await burn(walletZeroGas);
  });
}

main();
