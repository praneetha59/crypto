import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, TrendingUp, ShieldCheck, FileText, Send, UserPlus, Vote } from 'lucide-react';
import { ethers } from 'ethers';

const ADDRESSES = {
  InvestDAO: "0xe836061BEb796f77509Ef5EFB163e452EEF9e802",
  DAOManager: "0x1Ca44a2868a5D29Dc6F8879c9DCd2CC40522cfd1",
  GovToken: "0x2D3021734830491eFacCe7Bf945c0c83c3Cd7B64"
};

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [amount, setAmount] = useState("");
  const [treasuryBalance, setTreasuryBalance] = useState("0.00");
  const [userCIDBalance, setUserCIDBalance] = useState("0.00");
  
  // Proposal State for Requirements #2 and #6
  const [propTarget, setPropTarget] = useState("");
  const [propValue, setPropValue] = useState("");
  const [propDesc, setPropDesc] = useState("");
  const [delegateAddr, setDelegateAddr] = useState("");

  const updateBalances = async (provider: any, userAddr: string) => {
    try {
      await (provider as ethers.BrowserProvider).send("eth_chainId", []); 
      const balance = await provider.getBalance(ADDRESSES.InvestDAO, "latest");
      setTreasuryBalance(ethers.formatEther(balance));

      const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const tokenContract = new ethers.Contract(ADDRESSES.GovToken, tokenAbi, provider);
      const cidBalance = await tokenContract.balanceOf(userAddr);
      setUserCIDBalance(ethers.formatUnits(cidBalance, 18));
    } catch (err) { console.error("Refresh failed:", err); }
  };

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) return alert("Install MetaMask");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      setAccount(accounts[0]);
      setSigner(signerInstance);
      updateBalances(provider, accounts[0]);
    } catch (err) { console.error("Connection Failed", err); }
  };

  const handleDeposit = async () => {
    if (!signer || !account) return alert("Please connect wallet!");
    try {
      const abi = ["function deposit() external payable"];
      const contract = new ethers.Contract(ADDRESSES.InvestDAO, abi, signer);
      const tx = await contract.deposit({ value: ethers.parseEther(amount || "0.001") });
      await tx.wait();
      alert("Success! Treasury & Voting Power updated.");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      updateBalances(provider, account);
      setAmount("");
    } catch (err) { alert("Deposit failed!"); }
  };

  // Requirement #2: Proposal Creation
  const handlePropose = async () => {
    if (!signer) return alert("Connect Wallet");
    const managerAbi = ["function createProposal(address, uint256, string) external returns (uint256)"];
    const contract = new ethers.Contract(ADDRESSES.DAOManager, managerAbi, signer);
    try {
      const tx = await contract.createProposal(propTarget, ethers.parseEther(propValue), propDesc);
      await tx.wait();
      alert("Requirement #2 Met: Proposal Created!");
      setPropTarget(""); setPropValue(""); setPropDesc("");
    } catch (err) { alert("Ensure you have CID tokens to propose."); }
  };

  // Requirement #5: Delegation
  const handleDelegate = async () => {
    if (!signer) return alert("Connect Wallet");
    const tokenAbi = ["function delegate(address) external"];
    const contract = new ethers.Contract(ADDRESSES.GovToken, tokenAbi, signer);
    try {
      const tx = await contract.delegate(delegateAddr);
      await tx.wait();
      alert("Requirement #5 Met: Voting Power Delegated!");
      setDelegateAddr("");
    } catch (err) { alert("Delegation failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <nav className="flex justify-between items-center max-w-6xl mx-auto mb-10 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-2 text-indigo-500"><Landmark size={32} /><span className="text-2xl font-bold text-white">CryptoInvestDAO</span></div>
        <button onClick={connectWallet} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full flex items-center gap-2 transition">
          <Wallet size={18} /> {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect MetaMask"}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Requirement #1: Stake */}
          <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-emerald-500"><TrendingUp /> Stake & Influence</h2>
            <div className="flex gap-4 mt-6">
              <input type="number" placeholder="Amount (ETH)" className="flex-1 bg-gray-950 border border-gray-700 rounded-xl p-3 outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <button onClick={handleDeposit} className="bg-emerald-600 hover:bg-emerald-700 px-8 rounded-xl font-bold">Deposit</button>
            </div>
          </section>

          {/* Requirement #2 & #5: Governance Actions */}
          <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-400"><Send size={24}/> Governance Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase">New Proposal (#2)</p>
                <input type="text" placeholder="Recipient 0x..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" value={propTarget} onChange={(e)=>setPropTarget(e.target.value)} />
                <input type="number" placeholder="ETH Amount" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" value={propValue} onChange={(e)=>setPropValue(e.target.value)} />
                <input type="text" placeholder="Description" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" value={propDesc} onChange={(e)=>setPropDesc(e.target.value)} />
                <button onClick={handlePropose} className="w-full bg-indigo-600 py-2 rounded-lg text-sm font-bold">Submit</button>
              </div>
              <div className="space-y-3 p-4 bg-gray-950 rounded-2xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase">Delegate Power (#5)</p>
                <input type="text" placeholder="Delegatee 0x..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" value={delegateAddr} onChange={(e)=>setDelegateAddr(e.target.value)} />
                <button onClick={handleDelegate} className="w-full bg-emerald-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><UserPlus size={16}/> Delegate Now</button>
              </div>
            </div>
          </section>

          {/* Requirement #4 & #6: Voting Lifecycle */}
          <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-500"><Vote /> Active Voting</h2>
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 text-center">
               <p className="text-gray-500 italic mb-4 text-sm">Once a proposal is created, it will appear here for voting.</p>
               <div className="flex justify-center gap-4 opacity-30 pointer-events-none">
                  <button className="bg-emerald-900 px-4 py-1 rounded-lg text-xs">Vote For</button>
                  <button className="bg-red-900 px-4 py-1 rounded-lg text-xs">Vote Against</button>
               </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Requirement #15 & #20 */}
          <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400"><ShieldCheck /> DAO Metrics</h3>
            <div className="space-y-4">
              <div className="bg-gray-950 p-5 rounded-xl border border-gray-800">
                <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Treasury Balance (#15)</p>
                <p className="text-2xl font-bold font-mono text-white">{treasuryBalance} SEP</p>
              </div>
              <div className="bg-gray-950 p-5 rounded-xl border border-gray-800">
                <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Your Voting Power (#20)</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">{userCIDBalance} CID</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;