"use client";

import {
    Check,
    Copy,
    Download,
    Link,
    MessageSquare,
    QrCode,
    User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "~/hooks/useTranslation";

declare global {
  interface Window {
    QRious: any;
  }
}



const QRCodeGenerator = () => {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  const [activeTab, setActiveTab] = useState("url");
  const [qrData, setQrData] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadSize, setDownloadSize] = useState(1000);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  // Form states for different types
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    url: "",
  });

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = "";
      }
      return;
    }

    try {
      // Load QRious library dynamically
      if (!window.QRious) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
        script.onload = () => {
          createQR(text);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error("Error loading QR library:", error);
      // Fallback to Google Charts API
      generateFallbackQR(text);
    }
  };

  const createQR = (text: string) => {
    if (!qrContainerRef.current) return;

    try {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = "";

      // Create canvas element
      const canvas = document.createElement("canvas");
      qrContainerRef.current.appendChild(canvas);

      // Generate QR code
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: "white",
        foreground: "black",
        level: "M",
      });

      // Style the canvas
      canvas.className = "w-full h-auto rounded-xl shadow-lg bg-white";
      canvas.style.maxWidth = "300px";
      canvas.style.height = "auto";
    } catch (error) {
      console.error("Error creating QR code:", error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text: string | number | boolean) => {
    if (!qrContainerRef.current) return;

    // Clear previous content
    qrContainerRef.current.innerHTML = "";

    // Create img element for fallback
    const img = document.createElement("img");
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = t("qrCodeAlt");
    img.className = "w-full h-auto rounded-xl shadow-lg bg-white p-4";
    img.style.maxWidth = "300px";
    img.style.height = "auto";

    // Add error handling for the fallback image
    img.onerror = () => {
      // If Google Charts also fails, try QR Server API
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
    };

    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url: string) => {
    if (!url.trim()) return "";

    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  const generateVCard = (contact: {
    firstName: any;
    lastName: any;
    phone: any;
    email: any;
    organization: any;
    url: any;
  }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  useEffect(() => {
    let data = "";

    switch (activeTab) {
      case "url":
        data = formatUrl(urlInput);
        break;
      case "text":
        data = textInput;
        break;
      case "contact":
        if (
          contactInfo.firstName ||
          contactInfo.lastName ||
          contactInfo.phone ||
          contactInfo.email
        ) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = "";
    }

    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;

    try {
      // Create a temporary high-resolution canvas
      const tempCanvas = document.createElement("canvas");

      if ((window as any).QRious) {
        new (window as any).QRious({
          element: tempCanvas,
          value: qrData,
          size: downloadSize,
          background: "white",
          foreground: "black",
          level: "H", // High error correction
        });

        // Download the high-res version
        const link = document.createElement("a");
        link.download = `qr-code-${activeTab}-${Download}px.png`;
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
      } else {
        // Fallback to displaying canvas if QRious not available
        const canvas = qrContainerRef.current?.querySelector("canvas");
        const img = qrContainerRef.current?.querySelector("img");

        if (canvas) {
          const link = document.createElement("a");
          link.download = `qr-code-${activeTab}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        } else if (img) {
          const link = document.createElement("a");
          link.download = `qr-code-${activeTab}.png`;
          link.href = img.src;
          link.click();
        }
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput("");
    setTextInput("");
    setContactInfo({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      organization: "",
      url: "",
    });
    setQrData("");
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = "";
    }
  };
  const tabs = [
    { id: "url", label: t("urlTab"), icon: Link },
    { id: "text", label: t("textTab"), icon: MessageSquare },
    { id: "contact", label: t("contactTab"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
            {t("appTitle")}
          </h1>
          <p className="text-lg text-gray-600">{t("appDescription")}</p>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-b-2 border-purple-600 bg-purple-50 text-purple-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Input Section */}
              <div className="space-y-6">
                <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                  {activeTab === "url" && t("enterUrl")}
                  {activeTab === "text" && t("enterText")}
                  {activeTab === "contact" && t("contactInformation")}
                </h2>

                {/* URL Input */}
                {activeTab === "url" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("websiteUrl")}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t("urlPlaceholder")}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t("urlHelp")}</p>
                  </div>
                )}

                {/* Text Input */}
                {activeTab === "text" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("textContent")}
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t("textPlaceholder")}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Contact Input */}
                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("firstName")}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.firstName}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              firstName: e.target.value,
                            })
                          }
                          placeholder={t("firstNamePlaceholder")}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("lastName")}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.lastName}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              lastName: e.target.value,
                            })
                          }
                          placeholder={t("lastNamePlaceholder")}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("phoneNumber")}
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder={t("phonePlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("emailAddress")}
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder={t("emailPlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("organization")}
                      </label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            organization: e.target.value,
                          })
                        }
                        placeholder={t("organizationPlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("website")}
                      </label>
                      <input
                        type="url"
                        value={contactInfo.url}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            url: e.target.value,
                          })
                        }
                        placeholder={t("websitePlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={resetForm}
                  className="w-full rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
                >
                  {t("clearAllFields")}
                </button>
              </div>

              {/* QR Code Display Section */}
              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {t("generatedQrCode")}
                </h2>

                <div className="w-full max-w-sm rounded-2xl bg-gray-50 p-8">
                  {qrData ? (
                    <div className="text-center">
                      <div ref={qrContainerRef} className="flex justify-center">
                        {/* QR code will be dynamically inserted here */}
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        {t("scanQrCode")}
                      </p>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <QrCode className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                      <p className="text-gray-500">{t("fillFormPrompt")}</p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <>
                    <div className="w-full max-w-sm">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("downloadSizeLabel")}
                      </label>
                      <select
                        value={downloadSize}
                        onChange={(e) =>
                          setDownloadSize(Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={4000}>{t("sizeXLarge")}</option>
                        <option value={8000}>{t("sizeMaximum")}</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("downloadSizeHelp")}
                      </p>
                    </div>

                    <div className="flex w-full max-w-sm gap-4">
                      <button
                        onClick={downloadQRCode}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        {t("download")}
                      </button>

                      <button
                        onClick={copyToClipboard}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            {t("copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            {t("copyData")}
                          </>
                        )}
                      </button>
                    </div>

                    {qrData && (
                      <div className="w-full max-w-sm">
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          {t("qrCodeData")}
                        </h3>
                        <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-600">
                          <pre className="break-words whitespace-pre-wrap">
                            {qrData}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t("footerText")}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
