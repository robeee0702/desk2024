'use client'
import { useState } from 'react';


export default function Impressum() {
  const [selectedPdf, setSelectedPdf] = useState('/privacy_en.pdf');

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <button
        onClick={() => setSelectedPdf('/privacy_en.pdf')}
        className={`w-36 p-1 m-1 rounded-md shadow-sm text-white ${selectedPdf === '/privacy_en.pdf' ? 'bg-blue' : 'bg-black84'} hover:scale-105 hover:opacity-80`}
      >
        English
      </button>
      <button
        onClick={() => setSelectedPdf('/privacy_de.pdf')}
        className={`w-36 p-1 m-1 rounded-md shadow-sm text-white ${selectedPdf === '/privacy_de.pdf' ? 'bg-blue' : 'bg-black84'} hover:scale-105 hover:opacity-80`}
      >
        German
      </button>
      <button
        onClick={() => setSelectedPdf('/privacy_hu.pdf')}
        className={`w-36 p-1 m-1 rounded-md shadow-sm text-white ${selectedPdf === '/privacy_hu.pdf' ? 'bg-blue' : 'bg-black84'} hover:scale-105 hover:opacity-80`}
      >
        Hungarian
      </button>
      <a
        href='/'
        className={`w-36 p-2 mx-12 md:mx-12 m-1 rounded-md shadow-sm text-white bg-black56 hover:scale-105 hover:opacity-80`}
      >
        Home
      </a>

      <iframe
        src={selectedPdf}
        style={{ width: "100%", height: "90vh" }}
        frameBorder="0"
      >
        Your browser does not support iframes.
      </iframe>
    </div>
  );
}