
import React, { useState } from 'react';
import { BANK_DETAILS } from '../constants';

const Registry: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="registry" className="py-24 bg-amber-50 scroll-mt-20">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="mb-12 space-y-4">
          <span className="text-amber-600 font-cursive text-3xl">Gifts & Support</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900">The Wishing Well</h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-amber-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <p className="text-gray-600 leading-relaxed italic text-lg">
              "{BANK_DETAILS.message}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-amber-50/50 p-8 rounded-2xl border border-dashed border-amber-200">
              <div className="text-left space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Bank Name</label>
                  <p className="text-2xl font-serif text-gray-800">{BANK_DETAILS.bankName}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Account Name</label>
                  <p className="text-gray-800 font-medium">{BANK_DETAILS.accountName}</p>
                </div>
              </div>

              <div className="relative group">
                <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm transition-all group-hover:shadow-md">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-amber-600 block mb-2">Account Number</label>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-serif tracking-widest text-gray-900">{BANK_DETAILS.accountNumber}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Copy Account Number"
                    >
                      {copied ? (
                        <svg className="w-6 h-6 text-green-500 animate-in zoom-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && <span className="absolute -bottom-6 right-0 text-[10px] text-green-600 font-bold uppercase tracking-widest">Copied!</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-gray-400">
               <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               <span className="text-sm italic">With all our love</span>
               <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registry;
