"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { TitleScreen } from "@/components/TitleScreen";
import { HowToScreen } from "@/components/HowToScreen";
import { MicCheckScreen } from "@/components/MicCheckScreen";
import { GameScreen } from "@/components/GameScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { BgmController } from "@/components/BgmController";
import { useTimer } from "@/hooks/useTimer";
import { useRecorder } from "@/hooks/useRecorder";
import {
  MOCK_CHALLENGES,
  TIME_LIMIT_SEC,
  TOTAL_ROUNDS,
} from "@/lib/mockData";
import { buildResult } from "@/lib/score";
import { getBestScore, saveResult } from "@/lib/storage";
import { saveResultToSupabase } from "@/lib/supabase";
import type {
  AnswerLog,
  Challenge,
  GameResult,
  StartResponse,
} from "@/types/game";

type Phase = "title" | "howto" | "micCheck" | "playing" | "result";

export default function Page() {
  const [phase, setPhase] = useState<Phase>("title");
  const [sessionId, setSessionId] = useState("");
  const [mockMode, setMockMode] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState(0);
  const [textFallback, setTextFallback] = useState(false);

  const timer = useTimer(TIME_LIMIT_SEC);
  const recorder = useRecorder();
  const finalizeRef = useRef<(() => void) | null>(null);

  const fetchStart = useCallback(async () => {
    try {
      const res = await fetch("/api/game/start", { method: "POST" });
      const data = (await res.json()) as StartResponse;
      setSessionId(data.sessionId);
      setMockMode(data.mockMode);
      setChallenges(
        data.challenges?.length ? data.challenges : MOCK_CHALLENGES,
      );
    } catch {
      setSessionId(`local-${Date.now()}`);
      setMockMode(true);
      setChallenges(MOCK_CHALLENGES);
    }
  }, []);

  useEffect(() => {
    setBest(getBestScore());
    void fetchStart();
  }, [fetchStart]);

  const finalize = useCallback(
    async (collected: AnswerLog[]) => {
      timer.stop();
      const fallback = buildResult(collected);
      try {
        const res = await fetch("/api/game/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answers: collected }),
        });
        const data = (await res.json()) as GameResult;
        const finalRes =
          data && typeof data.totalScore === "number" ? data : fallback;
        setResult(finalRes);
        saveResult({ sessionId, mockMode, result: finalRes, answers: collected });
        void saveResultToSupabase({
          sessionId,
          mockMode,
          result: finalRes,
          answers: collected,
        });
      } catch {
        setResult(fallback);
        saveResult({ sessionId, mockMode, result: fallback, answers: collected });
      }
      setPhase("result");
    },
    [sessionId, mockMode, timer],
  );

  finalizeRef.current = () => finalize(answers);

  useEffect(() => {
    timer.setOnExpire(() => {
      finalizeRef.current?.();
    });
  }, [timer]);

  const start = () => setPhase("howto");

  const onMicReady = () => {
    setTextFallback(false);
    setRoundIndex(0);
    setAnswers([]);
    setResult(null);
    timer.start();
    setPhase("playing");
  };

  const onTextFallback = () => {
    setTextFallback(true);
    setRoundIndex(0);
    setAnswers([]);
    setResult(null);
    timer.start();
    setPhase("playing");
  };

  const onSubmitted = (log: AnswerLog) => {
    const next = [...answers, log];
    setAnswers(next);
    if (next.length >= TOTAL_ROUNDS) {
      void finalize(next);
    } else {
      setRoundIndex((i) => i + 1);
    }
  };

  const onRetry = () => {
    setResult(null);
    setAnswers([]);
    setRoundIndex(0);
    setBest(getBestScore());
    setPhase("title");
    void fetchStart();
  };

  return (
    <>
      {phase === "title" && (
        <TitleScreen onStart={start} mockMode={mockMode} />
      )}
      {phase === "howto" && <HowToScreen onNext={() => setPhase("micCheck")} />}
      {phase === "micCheck" && (
        <MicCheckScreen
          onReady={onMicReady}
          onTextFallback={onTextFallback}
          requestMic={recorder.requestMic}
        />
      )}
      {phase === "playing" && challenges[roundIndex] && (
        <GameScreen
          challenge={challenges[roundIndex]}
          round={roundIndex + 1}
          totalRounds={TOTAL_ROUNDS}
          totalSec={TIME_LIMIT_SEC}
          remainingSec={timer.remainingSec}
          mockMode={mockMode}
          sessionId={sessionId}
          textFallback={textFallback}
          onSubmitted={onSubmitted}
        />
      )}
      {phase === "result" && result && (
        <ResultScreen
          result={result}
          answers={answers}
          best={best}
          onRetry={onRetry}
        />
      )}

      <BgmController src="/audio/bgm.mp3" />
    </>
  );
}
