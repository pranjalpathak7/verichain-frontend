import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './constants.js';
import { useTheme } from './contexts/ThemeContext';

// --- (We will create these components in the next steps) ---
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import VerifierDashboard from './components/VerifierDashboard';
import ThemeToggle from './components/ThemeToggle';

function App() {
  // --- State Variables ---
  const { isDark } = useTheme();
  
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
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          VeriChain - Academic Ledger
        </h1>
        <button
          onClick={connectWallet}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Connect Your Wallet
        </button>
      </div>
    </div>
  );

  // Renders the main application UI after connection
  const renderApp = () => {
    // Normalize addresses for comparison
    const isOwner = currentAccount.toLowerCase() === contractOwner;

    return (
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          VeriChain - Academic Ledger
        </h1>
        
        <p className="text-center mb-6 text-gray-700 dark:text-slate-300">
          <strong className="text-gray-600 dark:text-slate-400">Your Address:</strong>{' '}
          <span className="font-mono text-sm bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-3 py-1 rounded-lg border border-gray-300 dark:border-slate-700">
            {currentAccount}
          </span>
        </p>
        
        {/* --- DYNAMICALLY RENDER COMPONENTS BASED ON ROLE --- */}
        
        {/* If the user is the contract owner, show the Admin Dashboard */}
        {isOwner && (
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500/50 rounded-xl p-6 my-6 shadow-xl">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Admin Dashboard</h2>
            {/* <AdminDashboard contract={contract} setIsLoading={setIsLoading} /> */}
            <AdminDashboard contract={contract} isLoading={isLoading} setIsLoading={setIsLoading} />
          </div>
        )}
        
        {/* Show the Student Dashboard (for all connected users) */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-gray-300 dark:border-slate-700/50 rounded-xl p-6 my-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-4">My Credentials</h2>
          {/* <StudentDashboard contract={contract} /> */}
          <StudentDashboard contract={contract} />
        </div>

        {/* Show the Public Verifier Dashboard (for all connected users) */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-gray-300 dark:border-slate-700/50 rounded-xl p-6 my-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-4">Public Verifier</h2>
          {/* <VerifierDashboard contract={contract} /> */}
          <VerifierDashboard contract={contract} />
        </div>

        {/* --- Global Loading Spinner --- */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/50 dark:bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 px-8 py-6 rounded-xl border border-gray-300 dark:border-slate-700 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <div className="text-gray-900 dark:text-white text-xl font-semibold">
                  Processing Transaction... (Please wait)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Main Return ---
  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen transition-colors duration-300">
        {!currentAccount ? renderConnectButton() : renderApp()}
      </div>
    </>
  );
}

export default App;