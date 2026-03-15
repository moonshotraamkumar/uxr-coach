'use client';

import { useRef, useState } from 'react';

interface AnswerInputProps {
  questionId: string;
  value: string;
  onChange: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  loading: boolean;
}

export function AnswerInput({ questionId, value, onChange, onSubmit, loading }: AnswerInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseValueRef = useRef('');
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const canSubmit = value.trim().length >= 20 && !loading && !isListening;

  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    baseValueRef.current = value;
    finalTranscriptRef.current = '';
    isListeningRef.current = true;
    setIsListening(true);
    setVoiceError(null);

    function createSession() {
      const recognition: SpeechRecognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let finalChunk = '';
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finalChunk += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (finalChunk) finalTranscriptRef.current += finalChunk;
        const spoken = finalTranscriptRef.current + interim;
        const base = baseValueRef.current;
        const combined = base ? base.trimEnd() + ' ' + spoken.trimStart() : spoken;
        onChange(questionId, combined);
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          createSession();
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') return;
        isListeningRef.current = false;
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone access denied. Allow it in your browser settings and try again.');
        } else if (event.error === 'audio-capture') {
          setVoiceError('No microphone found. Connect one and try again.');
        } else {
          setVoiceError('Voice input unavailable.');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }

    createSession();
  }

  function stopListening() {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
        Your answer
      </label>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(questionId, e.target.value)}
          placeholder="Write your answer here — or tap Voice to speak it. The more specific you are, the more useful the feedback."
          rows={8}
          className="w-full rounded-xl border border-border bg-surface text-ink placeholder:text-subtle text-base leading-relaxed px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-sage/40 transition-shadow"
        />
        {isListening && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-amber-light text-amber text-xs font-medium px-2.5 py-1 rounded-lg border border-amber/30 pointer-events-none">
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber"
              style={{ animation: 'pulseSoft 1s ease-in-out infinite' }}
            />
            Listening…
          </div>
        )}
      </div>

      {voiceError && <p className="text-xs text-amber">{voiceError}</p>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-subtle">
          {value.trim().length < 20 && value.length > 0
            ? 'Keep going — a bit more detail unlocks feedback'
            : ''}
        </p>

        <div className="flex items-center gap-2">
          {hasSpeechRecognition && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Stop recording' : 'Answer by voice'}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors border ${
                isListening
                  ? 'bg-amber-light text-amber border-amber/30'
                  : 'bg-surface text-muted border-border hover:border-sage hover:text-sage'
              }`}
            >
              <MicIcon animate={isListening} />
              {isListening ? 'Stop' : 'Voice'}
            </button>
          )}

          <button
            onClick={() => onSubmit(questionId)}
            disabled={!canSubmit}
            className="rounded-xl bg-sage text-white text-sm font-medium px-6 py-2.5 hover:bg-sage-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span>Getting feedback</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-white"
                      style={{
                        animation: 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        animationDelay: `${i * 200}ms`,
                      }}
                    />
                  ))}
                </span>
              </>
            ) : (
              'Get Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ animate }: { animate: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={animate ? { animation: 'pulseSoft 1s ease-in-out infinite' } : undefined}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
