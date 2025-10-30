import React from 'react';

// FIX: This component is no longer needed as the API key is handled via environment variables per @google/genai guidelines.
// The UI for managing API keys has been removed. Returning null to make it a no-op.

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = () => {
  return null;
};

export default SettingsModal;
