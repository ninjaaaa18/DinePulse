export type CommunityChallenge = {
  weekLabel: string;
  icon: string;
  title: string;
  goal: number;
  progress: number;
  unit: string;
  reward: string;
  rewardIcon: string;
};

export type CommunityStats = {
  usersJoined: number;
  usersCompleted: number;
  streakUsers: number;
};

export type EarnedBadge = {
  icon: string;
  label: string;
  tier: "bronze" | "silver" | "gold";
};

const CHALLENGES: CommunityChallenge[] = [
  { weekLabel: "This Week's Challenge", icon: "🥗", title: "Eat Healthy Meals", goal: 5, progress: 3, unit: "meals", reward: "Healthy Explorer Badge", rewardIcon: "🥈" },
  { weekLabel: "This Week's Challenge", icon: "💧", title: "Stay Hydrated Daily", goal: 7, progress: 5, unit: "days", reward: "Hydration Hero Badge", rewardIcon: "💧" },
  { weekLabel: "This Week's Challenge", icon: "🚶", title: "Walk After Meals", goal: 5, progress: 2, unit: "walks", reward: "Active Mover Badge", rewardIcon: "🚶" },
  { weekLabel: "This Week's Challenge", icon: "🥦", title: "Add Veggies to Meals", goal: 7, progress: 4, unit: "servings", reward: "Veggie Lover Badge", rewardIcon: "🥦" },
  { weekLabel: "This Week's Challenge", icon: "🧘", title: "Mindful Eating Days", goal: 5, progress: 1, unit: "days", reward: "Mindful Eater Badge", rewardIcon: "🧘" },
];

export function getWeeklyChallenge(): CommunityChallenge {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return CHALLENGES[seed % CHALLENGES.length];
}

export function getCommunityStats(): CommunityStats {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const joined = 1200 + (seed % 200);
  const completed = 700 + (seed % 100);
  const streak = 70 + (seed % 40);
  return { usersJoined: joined, usersCompleted: completed, streakUsers: streak };
}

export function getEarnedBadge(): EarnedBadge {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const badges: EarnedBadge[] = [
    { icon: "🥉", label: "Beginner", tier: "bronze" },
    { icon: "🥈", label: "Healthy Explorer", tier: "silver" },
    { icon: "🥇", label: "Nutrition Champion", tier: "gold" },
  ];
  return badges[seed % badges.length];
}

const MOTIVATIONAL_MESSAGES = [
  "Healthy habits are easier when everyone participates.",
  "Small daily improvements lead to lasting results.",
  "Consistency beats perfection.",
  "Every healthy meal is a step toward a better you.",
  "Your choices inspire others — keep going!",
  "Better eating, together.",
];

export function getMotivationalMessage(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return MOTIVATIONAL_MESSAGES[seed % MOTIVATIONAL_MESSAGES.length];
}
