'use client';

import { useState } from 'react';
import { Question, FeedbackResponse, AppPhase } from '@/lib/types';
import { JDInput } from '@/components/JDInput';
import { QuestionList } from '@/components/QuestionList';
import { RubricPanel } from '@/components/RubricPanel';
import { AnswerInput } from '@/components/AnswerInput';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ErrorState } from '@/components/ErrorState';

export default function Home() {
  // App phase
  const [phase, setPhase] = useState<AppPhase>('input');

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Selected question
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Per-question answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Per-question feedback
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackResponse>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [feedbackError, setFeedbackError] = useState<Record<string, string | null>>({});

  // Derived
  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;
  const selectedAnswer = selectedId ? (answers[selectedId] ?? '') : '';
  const selectedFeedback = selectedId ? (feedbackMap[selectedId] ?? null) : null;

  // ─── Handlers ───

  async function handleGenerateQuestions(jd: string) {
    setLoadingQuestions(true);
    setQuestionsError(null);
    setPhase('loading-questions');
    setQuestions([]);
    setAnswers({});
    setFeedbackMap({});
    setSelectedId(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd }),
      });

      const data = await res.json();

      if (!res.ok) {
        setQuestionsError(data.message ?? 'Something went wrong. Please try again.');
        setPhase('input');
        return;
      }

      setQuestions(data.questions);
      setPhase('questions');
      if (data.questions.length > 0) {
        setSelectedId(data.questions[0].id);
      }
    } catch {
      setQuestionsError('Something went wrong. Please check your connection and try again.');
      setPhase('input');
    } finally {
      setLoadingQuestions(false);
    }
  }

  function handleSelectQuestion(id: string) {
    setSelectedId(id);
  }

  function handleAnswerChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleGetFeedback(questionId: string) {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const answer = answers[questionId] ?? '';

    setFeedbackLoading((prev) => ({ ...prev, [questionId]: true }));
    setFeedbackError((prev) => ({ ...prev, [questionId]: null }));

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.text,
          rubric: question.rubric,
          answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedbackError((prev) => ({
          ...prev,
          [questionId]: data.message ?? 'Something went wrong. Please try again.',
        }));
        return;
      }

      setFeedbackMap((prev) => ({ ...prev, [questionId]: data }));
    } catch {
      setFeedbackError((prev) => ({
        ...prev,
        [questionId]: 'Something went wrong. Please check your connection and try again.',
      }));
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  }

  function handleChangeJD() {
    setPhase('input');
    setQuestions([]);
    setAnswers({});
    setFeedbackMap({});
    setSelectedId(null);
    setQuestionsError(null);
  }

  // ─── Render ───

  if (phase === 'input' || phase === 'loading-questions') {
    return (
      <>
        <JDInput onGenerate={handleGenerateQuestions} loading={loadingQuestions} />
        {questionsError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <ErrorState message={questionsError} onRetry={() => setQuestionsError(null)} />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-screen overflow-hidden">
      {/* Left panel — question list */}
      <aside className="border-r border-border overflow-y-auto bg-canvas">
        <QuestionList
          questions={questions}
          selectedId={selectedId}
          onSelect={handleSelectQuestion}
          loading={loadingQuestions}
          onChangeJD={handleChangeJD}
        />
      </aside>

      {/* Right panel — rubric + answer + feedback */}
      <section className="overflow-y-auto">
        {selectedQuestion ? (
          <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
            {/* Question text */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Question
              </p>
              <h2 className="text-lg font-medium text-ink leading-snug">
                {selectedQuestion.text}
              </h2>
            </div>

            {/* Rubric */}
            <RubricPanel
              key={selectedQuestion.id}
              rubric={selectedQuestion.rubric}

            />

            {/* Answer */}
            <AnswerInput
              questionId={selectedQuestion.id}
              value={selectedAnswer}
              onChange={handleAnswerChange}
              onSubmit={handleGetFeedback}
              loading={feedbackLoading[selectedQuestion.id] ?? false}
            />

            {/* Feedback error */}
            {feedbackError[selectedQuestion.id] && (
              <ErrorState
                message={feedbackError[selectedQuestion.id]!}
                onRetry={() =>
                  setFeedbackError((prev) => ({ ...prev, [selectedQuestion.id]: null }))
                }
              />
            )}

            {/* Feedback */}
            {selectedFeedback && <FeedbackPanel feedback={selectedFeedback} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            Select a question to begin
          </div>
        )}
      </section>
    </div>
  );
}
