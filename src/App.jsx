import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './constants.js';

// --- (We will create these components in the next steps) ---
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import VerifierDashboard from './components/VerifierDashboard';

function App() {
  // --- State Variables ---
  
  // Stores the user's public wallet address
  const [currentAccount, setCurrentAccount] = useState(null); 
  
  // Stores the ethers.js contract instance
  const [contract, setContract] = useState(null); 
  
  // Stores the 'owner' of the smart contract (the Institution)
  const [contractOwner, setContractOwner] = useState(null);
  
  // Stores loading state for transactions
  const [isLoading, setIsLoading] = useState(false);

  // --- useEffect Hook ---
  // Runs once when the component loads
  useEffect(() => {
    // Check if a wallet is already connected
    checkIfWalletIsConnected();
  }, []);

  // --- Core Functions ---

  /**
   * Checks if a MetaMask wallet is connected
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        // Load the smart contract
        loadContract(ethereum); 
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Prompts the user to connect their MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask! -> https://metamask.io/");
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      
      // Load the contract after a successful connection
      loadContract(ethereum);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Loads the smart contract instance and its owner
   */
  const loadContract = async (ethereum) => {
    try {
      // Create a "provider" to talk to the blockchain
      const provider = new ethers.BrowserProvider(ethereum);
      
      // Get the "signer" (the user's wallet) to sign transactions
      const signer = await provider.getSigner();
      
      // Create an instance of our smart contract
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      
      console.log("Contract loaded:", contractInstance);
      setContract(contractInstance);

      // --- Get the contract owner ---
      // We call the 'owner()' function from the 'Ownable' contract we imported
      const owner = await contractInstance.owner();
      console.log("Contract Owner:", owner);
      setContractOwner(owner.toLowerCase()); // Store it in lowercase for easy comparison

    } catch (error) {
      console.error("Failed to load contract:", error);
    }
  };

  // --- Render Function ---

  // Renders the "Connect Wallet" button if no account is connected
  const renderConnectButton = () => (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={connectWallet}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Connect Your Wallet
      </button>
    </div>
  );

  // Renders the main application UI after connection
  const renderApp = () => {
    // Normalize addresses for comparison
    const isOwner = currentAccount.toLowerCase() === contractOwner;

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          VeriChain - Academic Ledger
        </h1>
        
        <p className="text-center mb-4">
          <strong>Your Address:</strong> {currentAccount}
        </p>
        
        {/* --- DYNAMICALLY RENDER COMPONENTS BASED ON ROLE --- */}
        
        {/* If the user is the contract owner, show the Admin Dashboard */}
        {isOwner && (
          <div className="border-4 border-blue-500 rounded-lg p-4 my-4">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Admin Dashboard</h2>
            {/* <AdminDashboard contract={contract} setIsLoading={setIsLoading} /> */}
            <AdminDashboard contract={contract} isLoading={isLoading} setIsLoading={setIsLoading} />
          </div>
        )}
        
        {/* Show the Student Dashboard (for all connected users) */}
        <div className="border-2 border-gray-300 rounded-lg p-4 my-4">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">My Credentials</h2>
          {/* <StudentDashboard contract={contract} /> */}
          <StudentDashboard contract={contract} />
        </div>

        {/* Show the Public Verifier Dashboard (for all connected users) */}
        <div className="border-2 border-gray-300 rounded-lg p-4 my-4">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Public Verifier</h2>
          {/* <VerifierDashboard contract={contract} /> */}
          <VerifierDashboard contract={contract} />
        </div>

        {/* --- Global Loading Spinner --- */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="text-white text-xl">
              Processing Transaction... (Please wait)
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Main Return ---
  return (
    <div className="min-h-screen bg-gray-100">
      {!currentAccount ? renderConnectButton() : renderApp()}
    </div>
  );
}

export default App;