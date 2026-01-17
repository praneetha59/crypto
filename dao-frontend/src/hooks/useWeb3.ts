import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      setAccount(accounts[0]);
      setSigner(signerInstance);
    } else {
      alert("Please install MetaMask!");
    }
  };

  return { account, signer, connectWallet };
};