import React, { useState, useEffect } from 'react';
import axios from 'axios';

// We use the Pinata public gateway to fetch IPFS data
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * A single card component to display a credential
 */
function CredentialCard({ credential }) {
  const [metadata, setMetadata] = useState(null);

  // Function to fetch metadata for Student IDs
  const fetchMetadata = async (cid) => {
    try {
      const { data } = await axios.get(`${IPFS_GATEWAY}${cid}`);
      setMetadata(data);
    } catch (error)
    {
      console.error("Failed to fetch IPFS metadata:", error);
      setMetadata({ name: "Error loading data" });
    }
  };

  // Check the type and fetch metadata if it's a Student ID
  useEffect(() => {
    if (credential.credentialType === 'STUDENT_ID' && credential.metadataCid) {
      fetchMetadata(credential.metadataCid);
    }
  }, [credential]);

  // --- Render different cards based on type ---

  if (credential.credentialType === 'STUDENT_ID') {
    return (
      <div className="bg-white dark:bg-slate-800/70 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-blue-300 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Student ID</h3>
        <hr className="my-3 border-gray-200 dark:border-slate-700" />
        {metadata ? (
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-200">{metadata.name}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 font-mono">
              Address: {metadata.studentAddress}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-slate-400">Loading student data...</p>
        )}
        <p className="text-xs text-gray-500 dark:text-slate-500 mt-4">
          Issued: {new Date(Number(credential.issueDate) * 1000).toLocaleDateString()}
        </p>
      </div>
    );
  }

  // For Diploma, Transcript, etc.
  return (
    <div className="bg-white dark:bg-slate-800/70 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-200 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600/50 transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200">
        {/* Capitalize the first letter */}
        {credential.credentialType.charAt(0).toUpperCase() + credential.credentialType.slice(1).toLowerCase()}
      </h3>
      <hr className="my-3 border-gray-200 dark:border-slate-700" />
      <p className="text-sm text-gray-700 dark:text-slate-300 truncate font-mono">
        <strong className="text-gray-600 dark:text-slate-400">Document Hash:</strong> {credential.documentHash}
      </p>
      <p className="text-xs text-gray-500 dark:text-slate-500 mt-4">
        Issued: {new Date(Number(credential.issueDate) * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}

/**
 * The main Student Dashboard component
 */
function StudentDashboard({ contract }) {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCredentials = async () => {
    if (!contract) {
      alert("Contract not loaded");
      return;
    }
    
    setIsLoading(true);
    setHasFetched(true); // Mark that we've tried fetching
    
    try {
      // Call the 'getMyCredentials' view function from the smart contract
      const creds = await contract.getMyCredentials();
      
      console.log("Fetched credentials:", creds);
      
      // Filter out any credentials that might have been revoked
      const activeCreds = creds.filter(cred => cred.active === true);
      
      setCredentials(activeCreds);

    } catch (error) {
      console.error("Error fetching credentials:", error);
      alert("Failed to fetch credentials. See console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={fetchCredentials}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-md shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-[1.02]
                   disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Fetching...' : 'Fetch My Credentials'}
      </button>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((cred, index) => (
          <CredentialCard key={index} credential={cred} />
        ))}
      </div>
      
      {/* Show a message if they have no credentials */}
      {hasFetched && !isLoading && credentials.length === 0 && (
        <p className="text-center text-gray-600 dark:text-slate-400 mt-6">
          You have no active credentials.
        </p>
      )}
    </div>
  );
}

export default StudentDashboard;