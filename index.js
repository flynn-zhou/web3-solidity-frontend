import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { abi,contractAddress } from "./constants.js";


const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;
const fundButton = document.getElementById("fundButton");
fundButton.onclick = fund;
const getBalanceButton = document.getElementById("getBalanceButton");
getBalanceButton.onclick = getBalance;

const doWithdrawButton = document.getElementById("doWithdraw");
doWithdrawButton.onclick = withdraw;

async function connect(){
    if(typeof window.ethereum != "undifined"){
        console.log("i see a metamask");

        if(document.getElementById("connectButton").innerHTML.trim() == "Connect"){
            
            await window.ethereum.request({
                "method": "eth_requestAccounts",
                "params": []
            });

            document.getElementById("connectButton").innerHTML = "connected!";
        }else{
            console.log(" already connected!");
        }

    }else{
        document.getElementById("connectButton").innerHTML = "install metamask first!";
        console.log("no metamask!");
    }
}

async function getBalance(){
    if(typeof window.ethereum != "undifined"){
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.formatEther(balance));
    }
}

async function withdraw(){
    if(typeof window.ethereum != "undifined"){
        console.log("Do Withdrawing...")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, abi, signer);

        try{
            const transactionResponse = await contract.withdraw();

            await listenForTransactionMine(transactionResponse, provider);
            console.log("Withdraw Done!")
        }catch(e){

        }
    }
}

async function fund(){
    const ethAmount = document.getElementById("ethAmount").value;
    if(typeof window.ethereum != "undifined"){
        console.log("fund....");
        const provider = new ethers.BrowserProvider(window.ethereum)
        console.log(provider)
        const signer = await provider.getSigner();
        console.log(signer)

        const contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("contract:"+contract);
        // provider.broadcastTransaction(signedTx)

        try{
            const transactionResponse = await contract.fund({value: ethers.parseEther(ethAmount)});
            // await response.wait(1);

            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!")
        }catch(error){
            console.log(error);
        }
        

    }
}

function listenForTransactionMine(transactionResponse, provider){
    console.log(`mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    });
    

}