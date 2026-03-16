import type { Habit } from "@/types";

export const HABITS: Habit[] = [
  { id: "morning-walk-sun", name: "Morning Walk Sun", category: "daily", order: 1 },
  { id: "less-time-bathroom", name: "Less time in bathroom", category: "daily", order: 2 },
  { id: "goog-puja", name: "Goog Puja", category: "daily", order: 3 },
  { id: "eat-healthy", name: "Eat Healthy", category: "daily", order: 4 },
  { id: "morning-aarti", name: "Morning Aarti", category: "daily", order: 5 },
  { id: "nitya-prerna", name: "Nitya Prerna", category: "daily", order: 6 },
  { id: "gym", name: "Gym", category: "daily", order: 7 },
  { id: "vachnamrut-swami", name: "Vachnamrut + Swami ni Vato", category: "daily", order: 8 },
  { id: "afternoon-mansi", name: "Afternoon Mansi", category: "daily", order: 9 },
  { id: "thal-morning", name: "Thal", category: "daily", order: 10 },
  { id: "lunch-before-3", name: "Lunch before 3", category: "daily", order: 11 },
  { id: "play-tt", name: "Play TT in evening", category: "daily", order: 12 },
  { id: "eat-healthy-snacks", name: "Eat Healthy Snacks", category: "daily", order: 13 },
  { id: "evening-aarti", name: "Evening Aarti", category: "daily", order: 14 },
  { id: "evening-mansi", name: "Evening Mansi", category: "daily", order: 15 },
  { id: "thal-evening", name: "Thal", category: "daily", order: 16 },
  { id: "dinner-before-11", name: "Dinner before 11", category: "daily", order: 17 },
  { id: "read-jivan-charitra", name: "Read Jivan Charitra", category: "daily", order: 18 },
  { id: "prapti-no-vichar", name: "Prapti no Vichar", category: "daily", order: 19 },
  { id: "chesta", name: "Chesta", category: "daily", order: 20 },
  { id: "no-porn", name: "No Porn", category: "daily", order: 21 },
  { id: "social-media-limit", name: "Social Media < 30 mins", category: "daily", order: 22 },
  { id: "sleep-by-1", name: "Sleep by 1", category: "daily", order: 23 },
  { id: "learn-piano", name: "Learn piano", category: "extra", order: 24 },
  { id: "extra-mala", name: "Do extra mala", category: "extra", order: 25 },
  { id: "read-5am-club", name: "Read 5 am club book", category: "extra", order: 26 },
  { id: "content-creation", name: "Do content creation", category: "extra", order: 27 },
  { id: "freelancing-tasks", name: "Freelancing Project tasks", category: "extra", order: 28 },
  { id: "dhwaniagent-tasks", name: "Dhwaniagent Tasks", category: "extra", order: 29 },
  { id: "cost-estimator-tasks", name: "Cost estimator tasks", category: "extra", order: 30 },
];

export const DAILY_HABITS = HABITS.filter((h) => h.category === "daily");
export const EXTRA_HABITS = HABITS.filter((h) => h.category === "extra");
