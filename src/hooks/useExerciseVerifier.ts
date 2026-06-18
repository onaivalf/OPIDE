import { invoke } from '@tauri-apps/api/core'

export interface ExerciseResult {
  exercise_id: string
  passed: boolean
  score: number
  feedback: string
  tests_passed: number
  tests_total: number
  execution_time_ms: number
  error_message?: string
}

export interface ExerciseDefinition {
  id: string
  title: string
  description: string
  language: string
  starter_code: string
  tests: TestConfig[]
  hints: string[]
  max_score: number
  time_limit_ms: number
}

export interface TestConfig {
  name: string
  input?: string
  expected_output?: string
  test_type: 'io' | 'unit' | 'integration' | 'performance' | 'static'
  weight: number
}

/**
 * Verifica a solução de um exercício
 */
export async function verifyExercise(
  exerciseId: string,
  userCode: string
): Promise<ExerciseResult> {
  return await invoke<ExerciseResult>('verify_exercise', {
    exerciseId,
    userCode
  })
}

/**
 * Hook React para gerenciar estado de verificação de exercícios
 */
import { useState, useCallback } from 'react'

export function useExerciseVerifier() {
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (exerciseId: string, userCode: string) => {
    setVerifying(true)
    setError(null)
    setResult(null)

    try {
      const exerciseResult = await verifyExercise(exerciseId, userCode)
      setResult(exerciseResult)
      return exerciseResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setVerifying(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setVerifying(false)
  }, [])

  return {
    verifying,
    result,
    error,
    verify,
    reset
  }
}
