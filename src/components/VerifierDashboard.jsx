import React, { useState } from 'react';

/**
 * Hashes a file (like a PDF) in the browser using the Web Crypto API.
 * This MUST be the exact same function as in AdminDashboard.
 * @param {File} file The file to hash.
 * @returns {Promise<string>} The 0x-prefixed SHA-256 hash.
 */
const hashFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
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
    
    reader.readAsArrayBuffer(file);
  });
};


function VerifierDashboard({ contract }) {
  const [fileToVerify, setFileToVerify] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 'null' = not checked, 'true' = verified, 'false' = not verified
  const [verificationResult, setVerificationResult] = useState(null);

  /**
   * Handles the file input change
   */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileToVerify(null);
      setFileHash('');
      setVerificationResult(null);
      return;
    }
    
    setFileToVerify(file);
    setVerificationResult(null); // Reset result on new file
    
    try {
      const hash = await hashFile(file);
      setFileHash(hash);
    } catch (error) {
      console.error("Error hashing file:", error);
      alert("Error hashing file. See console.");
      setFileHash('');
    }
  };

  /**
   * Main function to check the document hash against the contract
   */
  const handleVerify = async () => {
    if (!contract || !fileHash) {
      alert("Contract not loaded or no file selected/hashed.");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // This is a 'view' function, so it's a free and instant call
      const isValid = await contract.verifyDocument(fileHash);
      
      console.log(`Hash ${fileHash} is valid: ${isValid}`);
      setVerificationResult(isValid);
      
    } catch (error) {
      console.error("Error verifying document:", error);
      alert("An error occurred during verification. See console.");
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Renders the verification result message
   */
  const renderResult = () => {
    if (isVerifying) {
      return <p className="text-center text-blue-600">Verifying...</p>;
    }
    
    if (verificationResult === null) {
      return null; // No result yet
    }
    
    if (verificationResult === true) {
      return (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <h4 className="font-bold text-lg">✅ Document is Authentic</h4>
          <p>This document's hash was found on the blockchain and is verified.</p>
        </div>
      );
    }
    
    if (verificationResult === false) {
      return (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <h4 className="font-bold text-lg">❌ Document NOT Recognized</h4>
          <p>This document's hash was not found on the blockchain, or the document has been altered.</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload a document (e.g., a diploma PDF) to check its authenticity
        against the blockchain.
      </p>
      
      {/* File Upload Input */}
      <div>
        <label htmlFor="fileVerify" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Document
        </label>
        <input
          type="file"
          id="fileVerify"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-50 file:text-gray-700
                     hover:file:bg-gray-100"
        />
        {fileHash && (
          <p className="mt-2 text-xs text-gray-600 truncate">
            <strong>File Hash:</strong> {fileHash}
          </p>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!fileHash || isVerifying}
        className="w-full px-4 py-2 bg-gray-800 text-white font-bold rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300
                   disabled:bg-gray-400"
      >
        {isVerifying ? 'Checking...' : 'Verify Authenticity'}
      </button>

      {/* Verification Result */}
      <div className="mt-4">
        {renderResult()}
      </div>
    </div>
  );
}

export default VerifierDashboard;