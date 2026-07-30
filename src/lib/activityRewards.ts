export type RewardTier = {
  minSteps: number;
  maxSteps: number;
  discount: number;
  badge: string;
  label: string;
  color: string;
};

export const REWARD_TIERS: RewardTier[] = [
  { minSteps: 0, maxSteps: 2999, discount: 0, badge: "", label: "No reward yet", color: "text-muted" },
  { minSteps: 3000, maxSteps: 5999, discount: 2, badge: "🌱", label: "Bronze Mover", color: "text-amber-400" },
  { minSteps: 6000, maxSteps: 9999, discount: 5, badge: "🔥", label: "Silver Achiever", color: "text-slate-300" },
  { minSteps: 10000, maxSteps: Infinity, discount: 10, badge: "🏆", label: "Healthy Champion", color: "text-emerald" },
];

export const DAILY_GOAL = 10000;
export const CALORIES_PER_STEP = 0.04;
export const STEP_ANIMATION_DURATION = 1500;

export type ActivityData = {
  steps: number;
  goal: number;
  caloriesBurned: number;
  progress: number;
  tier: RewardTier;
  stepsRemaining: number;
  motivationalText: string;
  isRewardUnlocked: boolean;
};

const DEMO_MIN = 3500;
const DEMO_MAX = 12500;
const HEALTHY_CHAMPION_MIN = 10000;

let cachedSteps: number | null = null;

export function generateDemoSteps(): number {
  if (cachedSteps !== null) return cachedSteps;
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
  const steps = Math.round(DEMO_MIN + pseudoRandom * (DEMO_MAX - DEMO_MIN));
  cachedSteps = steps;
  return steps;
}

export function computeActivityData(): ActivityData {
  const steps = generateDemoSteps();
  const progress = Math.min(100, Math.round((steps / DAILY_GOAL) * 100));
  const caloriesBurned = Math.round(steps * CALORIES_PER_STEP);
  const tier = REWARD_TIERS.find((t) => steps >= t.minSteps && steps <= t.maxSteps) || REWARD_TIERS[0];
  const stepsRemaining = Math.max(0, DAILY_GOAL - steps);

  let motivationalText: string;
  let isRewardUnlocked: boolean;

  if (steps >= HEALTHY_CHAMPION_MIN) {
    motivationalText = "Congratulations! You've unlocked today's Healthy Reward.";
    isRewardUnlocked = true;
  } else if (stepsRemaining <= 1500) {
    motivationalText = `You're only ${stepsRemaining} steps away from unlocking today's reward.`;
    isRewardUnlocked = false;
  } else {
    const nextTier = REWARD_TIERS.find((t) => t.discount > tier.discount);
    if (nextTier) {
      const toNextTier = nextTier.minSteps - steps;
      motivationalText = `${toNextTier} more steps to reach ${nextTier.label} (${nextTier.discount}% off).`;
    } else {
      motivationalText = "Keep moving to unlock your healthy reward!";
    }
    isRewardUnlocked = false;
  }

  return { steps, goal: DAILY_GOAL, caloriesBurned, progress, tier, stepsRemaining, motivationalText, isRewardUnlocked };
}

export function resetDemoSteps(): void {
  cachedSteps = null;
}
