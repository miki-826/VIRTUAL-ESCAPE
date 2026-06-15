import { NextResponse } from "next/server";
import { MOCK_CHALLENGES, TIME_LIMIT_SEC } from "@/lib/mockData";
import { HAS_OPENAI } from "@/lib/openai";
import type { StartResponse } from "@/types/game";

export async function POST() {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const body: StartResponse = {
    sessionId,
    mockMode: !HAS_OPENAI,
    challenges: MOCK_CHALLENGES,
    timeLimitSec: TIME_LIMIT_SEC,
  };
  return NextResponse.json(body);
}
