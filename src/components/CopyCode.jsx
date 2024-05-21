import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy } from 'react-icons/fi'; // Assuming you have installed react-icons package
import '../styles/CopyCode.css'; // Import CSS for styling

const CopyCode = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="copy-code-container">
      {/* <pre>
        <code>{code}</code>
      </pre> */}
      <CopyToClipboard text={code} onCopy={handleCopy}>
        <button className={`copy-button ${copied ? 'copied' : ''}`}>
          <span className="copy-text">{copied ? 'Copied!' : 'Copy'}</span>
          <FiCopy />
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default CopyCode;
