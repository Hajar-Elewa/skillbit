export const levelModifiers = {
  1: { multiplier: 1,   penalty: 0    },
  2: { multiplier: 2,   penalty: 0.20 },
  3: { multiplier: 3,   penalty: 0.50 },
}

export const rankModifiers = {
  'beginner': { multiplier: 1,   penalty: 0    },
  'bronze':   { multiplier: 1.2, penalty: 0.10 },
  'silver':   { multiplier: 1.4, penalty: 0.20 },
  'gold':     { multiplier: 1.6, penalty: 0.30 },
  'legend':   { multiplier: 1.8, penalty: 0.40 },
}

export const hardnessModifiers = {
  'easy':   { bonus: 0, penalty: 1 },
  'medium': { bonus: 2, penalty: 2 },
  'hard':   { bonus: 3, penalty: 1 },
}

export const leaderboardModifiers = {
  1: 1.5,
  2: 1.4,
  3: 1.3,
}

export const calculateQuestionScore = (
  baseScore: number,
  userLevel: number,
  userRank: string,
  difficulty: string,
  isCorrect: boolean,
  leaderboardPosition?: number
): { gained: number, lost: number } => {

  const level = levelModifiers[userLevel]
  const rank  = rankModifiers[userRank]
  const hard  = hardnessModifiers[difficulty]

  if (isCorrect) {
    let score = baseScore * level.multiplier  // level
    score = score * rank.multiplier           // rank
    score = score + hard.bonus                // hardness

    // leaderboard bonus applied at END of contest
    if (leaderboardPosition && leaderboardModifiers[leaderboardPosition]) {
      score = score * leaderboardModifiers[leaderboardPosition]
    }

    return { gained: Math.floor(score), lost: 0 }
  } 
  
  else {
    let loss = baseScore * level.penalty  // level penalty
    loss += baseScore * rank.penalty      // rank penalty
    loss += hard.penalty                  // hardness penalty

    return { gained: 0, lost: Math.floor(loss) }
  }
}