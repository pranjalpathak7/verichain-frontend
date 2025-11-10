import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios'; // We'll use axios to talk to Pinata

// Get the Pinata JWT from our .env file
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

function AdminDashboard({ contract, isLoading, setIsLoading }) {
  // --- State Variables ---
  const [studentAddress, setStudentAddress] = useState('');
  const [credentialType, setCredentialType] = useState('STUDENT_ID');
  
  // State for Student ID fields
  const [studentName, setStudentName] = useState('');
  // We'll skip the photo for simplicity, but you could add it here
  
  // State for Document fields (Diploma, Transcript)
  const [documentFile, setDocumentFile] = useState(null);
  const [documentHash, setDocumentHash] = useState(''); // To show the user the hash


  // --- Helper Functions ---

  /**
   * Hashes a file (like a PDF) in the browser using the Web Crypto API.
   * This is fast, secure, and happens locally.
   * @param {File} file The file to hash.
   * @returns {Promise<string>} The 0x-prefixed SHA-256 hash.
   */
  const hashFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          // Use the built-in Web Crypto API
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          
          // Convert the ArrayBuffer to a hex string
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hexHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          resolve(hexHash);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Uploads a JSON object to Pinata (IPFS)
   * @param {object} metadata The JSON object to upload.
   * @returns {Promise<string>} The IPFS CID (Content Identifier).
   */
  const uploadToIPFS = async (metadata) => {
    try {
      const data = JSON.stringify({
        pinataContent: metadata,
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: `${credentialType}_${studentAddress}.json`
        }
      });

      const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      });
      
      console.log("Metadata uploaded to IPFS:", res.data);
      return res.data.IpfsHash; // This is the CID
      
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload metadata to IPFS.");
    }
  };

  /**
   * Handles the file input change for documents
   */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setDocumentHash('');
      setDocumentFile(null);
      return;
    }
    
    setDocumentFile(file);
    
    // Hash the file immediately and show the user
    try {
      const hash = await hashFile(file);
      setDocumentHash(hash);
    } catch (error) {
      console.error("Error hashing file:", error);
      alert("Error hashing file. See console for details.");
    }
  };

  /**
   * Main function to handle the form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert("Contract not loaded. Please wait.");
      return;
    }

    let finalDocumentHash = '';
    let finalMetadataCid = '';

    setIsLoading(true); // Show the global loading spinner

    try {
      // --- Logic for STUDENT_ID ---
      if (credentialType === 'STUDENT_ID') {
        if (!studentName) {
          alert("Please enter a student name.");
          setIsLoading(false);
          return;
        }
        
        // 1. Create the metadata JSON
        const metadata = {
          name: studentName,
          studentAddress: studentAddress,
          type: "Student ID",
          issued: new Date().toISOString()
        };
        
        // 2. Upload JSON to IPFS
        finalMetadataCid = await uploadToIPFS(metadata);
        
        // 3. For an ID, we use the CID itself as a "document hash"
        //    to make it unique and verifiable.
        finalDocumentHash = `ipfs-json-cid:${finalMetadataCid}`;

      } 
      // --- Logic for DIPLOMA / TRANSCRIPT ---
      else {
        if (!documentFile || !documentHash) {
          alert("Please upload a document file.");
          setIsLoading(false);
          return;
        }
        
        // 1. The document hash was already calculated
        finalDocumentHash = documentHash;
        
        // 2. We don't need IPFS metadata for a simple document hash
        finalMetadataCid = "N/A"; 
      }

      // --- 4. Call the Smart Contract ---
      console.log("Calling issueCredential with:", 
        studentAddress, 
        finalDocumentHash, 
        credentialType, 
        finalMetadataCid
      );

      const tx = await contract.issueCredential(
        studentAddress,
        finalDocumentHash,
        credentialType,
        finalMetadataCid
      );

      console.log("Transaction sent:", tx.hash);
      
      // Wait for the transaction to be mined
      await tx.wait(); 
      
      console.log("Transaction mined:", tx.hash);
      alert("Credential Issued Successfully!");
      
      // Reset form
      setStudentAddress('');
      setStudentName('');
      setDocumentFile(null);
      setDocumentHash('');

    } catch (error) {
      console.error("Error issuing credential:", error);
      alert("Error issuing credential. (User may have rejected transaction). See console for details.");
    } finally {
      setIsLoading(false); // Hide the loading spinner
    }
  };


  // --- Dynamic Form Rendering ---

  const renderDynamicFields = () => {
    if (credentialType === 'STUDENT_ID') {
      return (
        <div className="mb-4">
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
            Student's Full Name
          </label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Jane Doe"
            required
          />
        </div>
      );
    } else {
      // For 'DIPLOMA', 'TRANSCRIPT', etc.
      return (
        <div className="mb-4">
          <label htmlFor="docFile" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Document (PDF, etc.)
          </label>
          <input
            type="file"
            id="docFile"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm 
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            required
          />
          {documentHash && (
            <p className="mt-2 text-xs text-gray-600 truncate">
              <strong>File Hash:</strong> {documentHash}
            </p>
          )}
        </div>
      );
    }
  };

  // --- Main Render ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student Address Input */}
      <div className="mb-4">
        <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Student's Wallet Address
        </label>
        <input
          type="text"
          id="studentAddress"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="0x..."
          required
        />
      </div>
      
      {/* Credential Type Selector */}
      <div className="mb-4">
        <label htmlFor="credentialType" className="block text-sm font-medium text-gray-700 mb-1">
          Credential Type
        </label>
        <select
          id="credentialType"
          value={credentialType}
          onChange={(e) => setCredentialType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="STUDENT_ID">Student ID</option>
          <option value="DIPLOMA">Diploma</option>
          <option value="TRANSCRIPT">Transcript</option>
        </select>
      </div>

      {/* Dynamic Fields */}
      {renderDynamicFields()}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading} // Disable button while loading
        className="w-full px-4 py-2 bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300
                   disabled:bg-gray-400"
      >
        {isLoading ? 'Issuing... (Please Wait)' : 'Issue Credential'}
      </button>
    </form>
  );
}

export default AdminDashboard;