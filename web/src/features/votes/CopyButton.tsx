import React, { useState, useCallback } from "react";
import { CheckCircle, Copy } from "react-feather";

interface CopyButtonProps {
  toCopy: string;
  iconSize?: number;
}

const CopyButton: React.FC<CopyButtonProps> = ({ toCopy, iconSize = 16 }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(toCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [toCopy]);

  return (
    <button
      onClick={copyToClipboard}
      className="flex h-4 w-4 items-center space-x-1 hover:text-gray-600 ml-2"
    >
      {isCopied ? <CheckCircle size={iconSize} /> : <Copy className="w-4 h-4" size={iconSize} />}
      <span>{isCopied ? "Copied" : ""}</span>
    </button>
  );
};

export default CopyButton;
