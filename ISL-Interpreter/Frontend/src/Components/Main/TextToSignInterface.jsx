import React, { useState } from 'react';
import { translateTextToSigns } from '../../ML/signNlpService';
import SignVideoPlayer from './SignVideoPlayer';

export default function TextToSignInterface() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [signSequence, setSignSequence] = useState([]);
  const [history, setHistory] = useState([]);

  const handleTranslate = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Use our Groq NLP service to get the signs
      const signs = await translateTextToSigns(inputText);
      setSignSequence(signs);
      
      // Add to history if successful and not empty
      if (signs.length > 0) {
        setHistory(prev => {
          const newEntry = { text: inputText, signs };
          // Keep only last 5 entries
          return [newEntry, ...prev.filter(i => i.text !== inputText)].slice(0, 5);
        });
      }
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsProcessing(false);
      setInputText(''); // Clear input after translation starts
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-6 rounded-[2rem] border border-gray-800 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <i className="ri-text-spacing text-blue-500"></i>
          Text to Sign
        </h2>
        <p className="text-gray-400 text-sm">
          Type English sentences. Groq AI will convert them into ISL signs and play them seamlessly.
        </p>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 mb-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl">
          <SignVideoPlayer signSequence={signSequence} />
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-auto">
        <form onSubmit={handleTranslate} className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message (e.g. 'Hello, what is your name?')"
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl py-4 pl-6 pr-32 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-translate-2"></i>
            )}
            Translate
          </button>
        </form>

        {/* History Quick Actions */}
        {history.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSignSequence(item.signs)}
                className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm border border-gray-700 transition-colors flex items-center gap-2"
              >
                <i className="ri-history-line text-xs opacity-50"></i>
                {item.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
