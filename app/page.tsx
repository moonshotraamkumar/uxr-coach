'use client';

import { useState } from 'react';
import { Question, FeedbackResponse, AppPhase } from '@/lib/types';
import { JDInput } from '@/components/JDInput';
import { QuestionList } from '@/components/QuestionList';
import { RubricPanel } from '@/components/RubricPanel';
import { AnswerInput } from '@/components/AnswerInput';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { RoleInsights } from '@/components/RoleInsights';
import { ErrorState } from '@/components/ErrorState';

export default function Home() {
  // App phase
  const [phase, setPhase] = useState<AppPhase>('input');

  // Questions + insights
  const [questions, setQuestions] = useState<Question[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
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
    setInsights([]);
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
      setInsights(data.insights ?? []);
      setPhase('questions');
      // Don't auto-select first question — show insights first
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
    setInsights([]);
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
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_360px] h-screen overflow-hidden">
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

      {/* Middle panel — question + answer + feedback */}
      <section className="overflow-y-auto border-r border-border">
        {selectedQuestion ? (
          <div className="px-8 py-8 flex flex-col gap-6">
            {/* Question text */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Question
              </p>
              <h2 className="text-3xl font-medium text-ink leading-snug">
                {selectedQuestion.text}
              </h2>
            </div>

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
          <div className="px-8 py-8">
            <RoleInsights insights={insights} />
            {!insights.length && (
              <p className="text-muted text-sm mt-8 text-center">Select a question to begin</p>
            )}
          </div>
        )}
      </section>

      {/* Right panel — rubric */}
      <aside className="overflow-y-auto bg-canvas">
        {selectedQuestion ? (
          <div className="px-5 py-8">
            <RubricPanel
              key={selectedQuestion.id}
              rubric={selectedQuestion.rubric}
            />
          </div>
        ) : (
          <div className="px-5 py-8">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Rubric</p>
            <p className="text-sm text-subtle mt-3">Select a question to see the rubric.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
