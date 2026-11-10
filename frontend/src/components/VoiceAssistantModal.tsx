import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, AlertCircle, RefreshCw, HelpCircle, Volume2, Plus, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-red-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-700 to-brand-600 text-white">
          <div className="flex items-center space-x-2">
            <Mic className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold">ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => { setMode('RECORD'); setQueryResponse(null); }}
            className={`flex-1 py-3 text-center font-bold text-sm sm:text-base border-b-2 transition-colors ${
              mode === 'RECORD'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ಹೊಸ ಆರ್ಡರ್ / ಮಾಹಿತಿ
          </button>
          <button
            onClick={() => { setMode('QUERY'); resetForm(); }}
            className={`flex-1 py-3 text-center font-bold text-sm sm:text-base border-b-2 transition-colors ${
              mode === 'QUERY'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ಪ್ರಶ್ನೆ ಕೇಳಿ (Search)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Mic Button & Status */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-brand-50 rounded-2xl border border-brand-100">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-mic ring-4 ring-red-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-200'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            
            <p className="font-semibold text-gray-700">
              {isListening ? (
                <span className="text-red-600 animate-pulse font-bold">
                  ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ
                </span>
              ) : (
                'ಮೈಕ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ'
              )}
            </p>

            {/* Live Transcript / Manual input */}
            <div className="w-full px-4">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={mode === 'RECORD' ? 'ಉದಾ: ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್, ಒಟ್ಟು ಸಾವಿರ...' : 'ಉದಾ: ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?'}
                className="w-full text-center bg-white border border-gray-300 rounded-xl px-4 py-2 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>
            
            {/* Quick Process Button for Manual / Finished Text */}
            {transcript && !isListening && (
              <button
                type="button"
                onClick={() => handleProcessSpeech(transcript)}
                disabled={isProcessing}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold flex items-center space-x-1.5 shadow"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>ಪರಿಶೀಲಿಸಿ (Process)</span>
              </button>
            )}
          </div>

          {/* Voice Errors or browser warnings */}
          {voiceError && (
            <div className="flex items-center space-x-2 p-3 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-xl text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* QUERY MODE RESULT */}
          {mode === 'QUERY' && queryResponse && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="font-bold flex items-center space-x-1">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span>ಉತ್ತರ:</span>
                </span>
                <button
                  onClick={() => speakText(queryResponse)}
                  className="text-xs bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-bold px-2 py-1 rounded-md"
                >
                  ಧ್ವನಿ ಕೇಳಿ
                </button>
              </div>
              <p className="text-lg font-semibold text-gray-900">{queryResponse}</p>
            </div>
          )}

          {/* RECORD MODE: EXTRACTED DRAFT CARD */}
          {mode === 'RECORD' && (customerName || garments.length > 0 || totalAmount) && (
            <div className="bg-white border-2 border-brand-200 rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-gray-900 text-base">ಗುರುತಿಸಲಾದ ವಿವರಗಳು (Extracted)</h3>
                <span className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">
                  ಕರಡು #{draftId || 'ಹೊಸದು'}
                </span>
              </div>

              {/* Ambiguity Resolution Alert */}
              {isAmbiguous && matchedCustomers.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-amber-900">
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
                        className={`text-left p-2 rounded border text-xs font-semibold flex justify-between items-center ${
                          customerId === c.id
                            ? 'bg-brand-600 text-white border-brand-700'
                            : 'bg-white hover:bg-amber-100 border-gray-300 text-gray-800'
                        }`}
                      >
                        <span>{c.name} ({c.phone || 'ಫೋನ್ ಇಲ್ಲ'})</span>
                        <span className="text-amber-800 font-bold">ಬಾಕಿ: ₹{c.outstanding_balance}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ಗ್ರಾಹಕರ ಹೆಸರು</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCustomerId(null);
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-semibold"
                  placeholder="ಗ್ರಾಹಕರ ಹೆಸರು ನಮೂದಿಸಿ"
                />
              </div>

              {/* Garment Items List */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">ಬಟ್ಟೆಗಳ ವಿವರ</label>
                  <button
                    type="button"
                    onClick={() => setGarments([...garments, { garment_name: 'ಬ್ಲೌಸ್', quantity: 1 }])}
                    className="text-xs text-brand-700 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ಬಟ್ಟೆ ಸೇರಿಸಿ</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {garments.map((g, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border">
                      <select
                        value={g.garment_name}
                        onChange={(e) => {
                          const updated = [...garments];
                          updated[idx].garment_name = e.target.value;
                          setGarments(updated);
                        }}
                        className="flex-1 bg-white border rounded px-2 py-1 text-sm font-semibold"
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
                        className="w-16 bg-white border rounded px-2 py-1 text-sm text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setGarments(garments.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ಒಟ್ಟು ಮೊತ್ತ (₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="ಉದಾ: 1000"
                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ಅಡ್ವಾನ್ಸ್ ಹಣ (₹)</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="ಉದಾ: 500"
                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ವಿತರಣಾ ದಿನಾಂಕ</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Sample Prompts Hint */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-1 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
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
                  className="text-xs bg-white hover:bg-brand-50 border border-gray-300 rounded-full px-2.5 py-1 text-gray-700 hover:border-brand-300 transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-base border border-gray-300 transition-colors"
          >
            ರದ್ದುಮಾಡಿ (Cancel)
          </button>
          
          {mode === 'RECORD' && (
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={isProcessing || (!customerName && !customerId)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-base text-white shadow-lg flex items-center justify-center space-x-2 transition-all ${
                isProcessing || (!customerName && !customerId)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 active:scale-95'
              }`}
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              <span>ಖಚಿತಪಡಿಸಿ ಉಳಿಸಿ (Save)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
