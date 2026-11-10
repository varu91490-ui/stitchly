import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, AlertCircle, RefreshCw, HelpCircle, Volume2, Plus, Trash2, Sparkles } from 'lucide-react';
import { useKannadaVoice } from '../hooks/useKannadaVoice';
import { voiceService } from '../services/voice';
import { VoiceParseResponse, ExtractedGarment, MatchedCustomer } from '../types';
import { GARMENT_OPTIONS, VOICE_SAMPLE_COMMANDS } from '../constants/kannada';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    isListening,
    transcript,
    setTranscript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
    speakText
  } = useKannadaVoice();

  const [mode, setMode] = useState<'RECORD' | 'QUERY'>('RECORD');
  const [draftId, setDraftId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted draft fields (editable)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [matchedCustomers, setMatchedCustomers] = useState<MatchedCustomer[]>([]);
  const [isAmbiguous, setIsAmbiguous] = useState<boolean>(false);
  const [garments, setGarments] = useState<ExtractedGarment[]>([]);
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [kannadaSummary, setKannadaSummary] = useState<string>('');

  // Query mode state
  const [queryResponse, setQueryResponse] = useState<string | null>(null);

  // Automatically start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftId(null);
      resetForm();
      if (isSupported) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen]);

  // When speech stops and we have a transcript, process it automatically
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleProcessSpeech(transcript);
    }
  }, [isListening]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerId(null);
    setMatchedCustomers([]);
    setIsAmbiguous(false);
    setGarments([]);
    setTotalAmount('');
    setAdvanceAmount('');
    setDeliveryDate('');
    setKannadaSummary('');
    setQueryResponse(null);
    setErrorMessage(null);
  };

  const handleProcessSpeech = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (mode === 'QUERY') {
        const res = await voiceService.query(text);
        setQueryResponse(res.kannada_response);
        speakText(res.kannada_response);
      } else {
        const res: VoiceParseResponse = await voiceService.parse(text, draftId);
        setDraftId(res.draft_id || null);
        setKannadaSummary(res.kannada_summary);

        if (res.customer_name) setCustomerName(res.customer_name);
        if (res.customer_id) setCustomerId(res.customer_id);
        if (res.is_ambiguous_customer) {
          setIsAmbiguous(true);
          setMatchedCustomers(res.matched_customers);
        } else {
          setIsAmbiguous(false);
          setMatchedCustomers([]);
        }

        if (res.garments && res.garments.length > 0) {
          setGarments(res.garments);
        }
        if (res.total_amount) setTotalAmount(res.total_amount.toString());
        if (res.advance_amount) setAdvanceAmount(res.advance_amount.toString());
        if (res.delivery_date) setDeliveryDate(res.delivery_date);

        speakText(res.kannada_summary);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ಮಾಹಿತಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!draftId) {
      setErrorMessage('ಮೊದಲು ಧ್ವನಿ ಮೂಲಕ ಮಾಹಿತಿಯನ್ನು ಮಾತನಾಡಿ');
      return;
    }
    if (!customerName.trim() && !customerId) {
      setErrorMessage('ಗ್ರಾಹಕರ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ');
      return;
    }
    if (isAmbiguous && !customerId) {
      setErrorMessage('ದಯವಿಟ್ಟು ಸರಿಯಾದ ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await voiceService.confirmDraft(draftId, {
        customer_name: customerName,
        customer_id: customerId,
        garments,
        total_amount: totalAmount ? parseFloat(totalAmount) : null,
        advance_amount: advanceAmount ? parseFloat(advanceAmount) : null,
        delivery_date: deliveryDate || null,
      });

      speakText('ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ಆರ್ಡರ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-violet-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-950 via-indigo-900 to-purple-950 text-white border-b border-violet-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-glow-amber">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center space-x-1.5">
                <span>ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-[11px] text-violet-200 font-medium">ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್-ಕನ್ನಡ ಮಿಶ್ರಣದಲ್ಲಿ ಮಾತನಾಡಿ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-violet-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100/80 p-1.5 border-b border-slate-200">
          <button
            onClick={() => { setMode('RECORD'); setQueryResponse(null); }}
            className={`flex-1 py-2.5 text-center font-black text-xs sm:text-sm rounded-2xl transition-all ${
              mode === 'RECORD'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ಹೊಸ ಆರ್ಡರ್ / ಮಾಹಿತಿ
          </button>
          <button
            onClick={() => { setMode('QUERY'); resetForm(); }}
            className={`flex-1 py-2.5 text-center font-black text-xs sm:text-sm rounded-2xl transition-all ${
              mode === 'QUERY'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ಪ್ರಶ್ನೆ ಕೇಳಿ (Search)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Radiant Jewel Mic Button & Status */}
          <div className="flex flex-col items-center justify-center py-6 px-4 space-y-3 bg-gradient-to-b from-violet-50/60 via-purple-50/30 to-white rounded-3xl border border-violet-100 shadow-sm">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-glow-violet transition-all active:scale-90 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-red-600 text-white animate-mic ring-4 ring-rose-200'
                  : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-indigo-800 text-white ring-4 ring-violet-200'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9 text-amber-200" />}
            </button>
            
            <p className="font-bold text-sm text-slate-700">
              {isListening ? (
                <span className="text-rose-600 animate-pulse font-black">
                  ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ
                </span>
              ) : (
                'ಮೈಕ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ'
              )}
            </p>

            {/* Live Transcript / Manual input */}
            <div className="w-full px-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={mode === 'RECORD' ? 'ಉದಾ: ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್, ಒಟ್ಟು ಸಾವಿರ...' : 'ಉದಾ: ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?'}
                className="w-full text-center bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
              />
            </div>
            
            {/* Quick Process Button for Manual / Finished Text */}
            {transcript && !isListening && (
              <button
                type="button"
                onClick={() => handleProcessSpeech(transcript)}
                disabled={isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-glow-violet transition-all active:scale-95"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>ಪರಿಶೀಲಿಸಿ (Process)</span>
              </button>
            )}
          </div>

          {/* Voice Errors or browser warnings */}
          {voiceError && (
            <div className="flex items-center space-x-2 p-3.5 bg-amber-50 text-amber-900 rounded-2xl text-xs font-semibold border border-amber-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <span>{voiceError}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2 p-3.5 bg-rose-50 text-rose-900 rounded-2xl text-xs font-semibold border border-rose-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* QUERY MODE RESULT */}
          {mode === 'QUERY' && queryResponse && (
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-emerald-900">
                <span className="font-black flex items-center space-x-1.5 text-sm">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span>ಉತ್ತರ:</span>
                </span>
                <button
                  onClick={() => speakText(queryResponse)}
                  className="text-xs bg-emerald-200 hover:bg-emerald-300 text-emerald-950 font-black px-2.5 py-1 rounded-lg transition-colors"
                >
                  ಧ್ವನಿ ಕೇಳಿ
                </button>
              </div>
              <p className="text-base font-extrabold text-slate-900">{queryResponse}</p>
            </div>
          )}

          {/* RECORD MODE: EXTRACTED DRAFT CARD */}
          {mode === 'RECORD' && (customerName || garments.length > 0 || totalAmount) && (
            <div className="bg-white border-2 border-violet-200 rounded-3xl p-4.5 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-1.5">
                  <span>ಗುರುತಿಸಲಾದ ವಿವರಗಳು</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <span className="text-[11px] bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full font-black">
                  ಕರಡು #{draftId || 'ಹೊಸದು'}
                </span>
              </div>

              {/* Ambiguity Resolution Alert */}
              {isAmbiguous && matchedCustomers.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                  <p className="text-xs font-black text-amber-950">
                    ⚠️ '{customerName}' ಹೆಸರಿನಲ್ಲಿ ಹಲವು ಗ್ರಾಹಕರಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCustomerId(c.id);
                          setCustomerName(c.name);
                          setIsAmbiguous(false);
                        }}
                        className={`text-left p-2.5 rounded-xl border text-xs font-bold flex justify-between items-center transition-all ${
                          customerId === c.id
                            ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                            : 'bg-white hover:bg-amber-100/70 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span>{c.name} ({c.phone || 'ಫೋನ್ ಇಲ್ಲ'})</span>
                        <span className="text-amber-800 font-black">ಬಾಕಿ: ₹{c.outstanding_balance}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಗ್ರಾಹಕರ ಹೆಸರು</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCustomerId(null);
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="ಗ್ರಾಹಕರ ಹೆಸರು ನಮೂದಿಸಿ"
                />
              </div>

              {/* Garment Items List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">ಬಟ್ಟೆಗಳ ವಿವರ</label>
                  <button
                    type="button"
                    onClick={() => setGarments([...garments, { garment_name: 'ಬ್ಲೌಸ್', quantity: 1 }])}
                    className="text-xs text-violet-700 font-black flex items-center space-x-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ಬಟ್ಟೆ ಸೇರಿಸಿ</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {garments.map((g, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <select
                        value={g.garment_name}
                        onChange={(e) => {
                          const updated = [...garments];
                          updated[idx].garment_name = e.target.value;
                          setGarments(updated);
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold"
                      >
                        {GARMENT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={g.quantity}
                        onChange={(e) => {
                          const updated = [...garments];
                          updated[idx].quantity = parseInt(e.target.value) || 1;
                          setGarments(updated);
                        }}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-center font-black"
                      />
                      <button
                        type="button"
                        onClick={() => setGarments(garments.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಒಟ್ಟು ಮೊತ್ತ (₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="ಉದಾ: 1000"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-emerald-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ಅಡ್ವಾನ್ಸ್ ಹಣ (₹)</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="ಉದಾ: 500"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-violet-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ವಿತರಣಾ ದಿನಾಂಕ</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Sample Prompts Hint */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <p className="text-xs font-black text-slate-600 mb-1.5 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-violet-600" />
              <span>ಹೀಗೆ ಮಾತನಾಡಬಹುದು:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_SAMPLE_COMMANDS.map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTranscript(cmd);
                    handleProcessSpeech(cmd);
                  }}
                  className="text-xs bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-full px-3 py-1 text-slate-700 font-medium transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-sm border border-slate-200 transition-colors"
          >
            ರದ್ದುಮಾಡಿ
          </button>
          
          {mode === 'RECORD' && (
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={isProcessing || (!customerName && !customerId)}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition-all ${
                isProcessing || (!customerName && !customerId)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-glow-violet active:scale-95'
              }`}
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              <span>ಖಚಿತಪಡಿಸಿ ಉಳಿಸಿ</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
