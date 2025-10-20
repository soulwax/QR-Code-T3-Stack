// src/components/QRCodeGenerator.tsx
'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

type TabType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

interface QRCodeGeneratorProps {
  className?: string;
}

export default function QRCodeGenerator({ className = '' }: QRCodeGeneratorProps) {
  // All hooks must be at the top, unconditionally
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadSize, setDownloadSize] = useState(1000);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate QR code whenever data changes
  useEffect(() => {
    if (!qrData.trim()) {
      setQrCodeDataUrl('');
      setError('');
      return;
    }

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(qrData, {
          width: downloadSize,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(url);
        setError('');
      } catch (err) {
        setError('Failed to generate QR code');
        setQrCodeDataUrl('');
      }
    };

    generateQR();
  }, [qrData, downloadSize]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setQrData('');
    setError('');
  };

  const handleInputChange = (value: string) => {
    setQrData(value);
    setError('');
  };

  const handleCopy = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const blob = await (await fetch(qrCodeDataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const getPlaceholder = (): string => {
    const placeholders: Record<TabType, string> = {
      url: 'https://example.com',
      text: 'Enter any text...',
      email: 'example@email.com',
      phone: '+1234567890',
      wifi: 'WIFI:T:WPA;S:NetworkName;P:Password;;',
    };
    return placeholders[activeTab];
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'url', label: 'URL' },
    { id: 'text', label: 'Text' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'wifi', label: 'WiFi' },
  ];

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <h1 className="text-3xl font-bold mb-6 text-center">QR Code Generator</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-6">
        <textarea
          value={qrData}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      {/* Size Control */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Download Size: {downloadSize}px
        </label>
        <input
          type="range"
          min="256"
          max="2048"
          step="128"
          value={downloadSize}
          onChange={(e) => setDownloadSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeDataUrl && (
        <div className="mb-6 flex flex-col items-center">
          <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
            <img
              src={qrCodeDataUrl}
              alt="Generated QR Code"
              className="max-w-full h-auto"
              style={{ width: `${downloadSize >> 2}px` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {qrCodeDataUrl && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Download
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}