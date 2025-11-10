import React, { useState } from 'react';
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
  useState(() => {
    if (credential.credentialType === 'STUDENT_ID' && credential.metadataCid) {
      fetchMetadata(credential.metadataCid);
    }
  }, [credential]);

  // --- Render different cards based on type ---

  if (credential.credentialType === 'STUDENT_ID') {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-700">Student ID</h3>
        <hr className="my-2" />
        {metadata ? (
          <div>
            <p className="text-lg font-semibold">{metadata.name}</p>
            <p className="text-sm text-gray-600">
              Address: {metadata.studentAddress}
            </p>
          </div>
        ) : (
          <p>Loading student data...</p>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Issued: {new Date(Number(credential.issueDate) * 1000).toLocaleDateString()}
        </p>
      </div>
    );
  }

  // For Diploma, Transcript, etc.
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">
        {/* Capitalize the first letter */}
        {credential.credentialType.charAt(0).toUpperCase() + credential.credentialType.slice(1).toLowerCase()}
      </h3>
      <hr className="my-2" />
      <p className="text-sm text-gray-600 truncate">
        <strong>Document Hash:</strong> {credential.documentHash}
      </p>
      <p className="text-xs text-gray-500 mt-4">
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
        className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300
                   disabled:bg-gray-400"
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
        <p className="text-center text-gray-600 mt-6">
          You have no active credentials.
        </p>
      )}
    </div>
  );
}

export default StudentDashboard;