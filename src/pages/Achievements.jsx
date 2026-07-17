import { useMemo, useState } from "react";
import useSessions from "../hooks/useSessions";
import { computeStreaks } from "../utils/streaks";

const CATEGORY_ICONS = {
  Listening: "🎧",
  Speaking: "🗣️",
  Reading: "📖",
  Writing: "✍️",
  Grammar: "🧬",
  Vocabulary: "🎴",
  "TV Shows": "📺",
  Podcasts: "🎙️",
  Shadowing: "👥",
  "AI Conversation": "🤖",
};

export default function Achievements() {
  const { sessions } = useSessions();
  const [activeFilter, setActiveFilter] = useState("all");

  // --- 1. CORE DATA CALCULATIONS (single pass over sessions) ---
  const stats = useMemo(() => {
    const categoryTotals = {};
    const dailyBreakdowns = {}; // key: dateString, value: { categories: Set, minutes: number }
    let totalMinutes = 0;
    let longestSession = 0;
    let earlyBirdSessions = 0; // 5 AM - 9 AM
    let nightOwlSessions = 0; // 12 AM - 5 AM
    let weekendSessions = 0; // Sat & Sun
    let sessionsUnder10MinCount = 0;
    let sessionsUnder5MinCount = 0;
    let longSessionCount90 = 0; // sessions >= 90 mins

    sessions.forEach((s) => {
      const date = new Date(s.date);
      const dateKey = date.toDateString();
      const mins = s.duration / 60;
      const hours = date.getHours();
      const day = date.getDay();

      totalMinutes += mins;

      if (mins > longestSession) longestSession = mins;
      if (mins < 10) sessionsUnder10MinCount++;
      if (mins < 5) sessionsUnder5MinCount++;
      if (mins >= 90) longSessionCount90++;

      categoryTotals[s.category] = (categoryTotals[s.category] || 0) + mins;

      if (hours >= 0 && hours < 5) nightOwlSessions++;
      if (hours >= 5 && hours < 9) earlyBirdSessions++;
      if (day === 0 || day === 6) weekendSessions++;

      if (!dailyBreakdowns[dateKey]) {
        dailyBreakdowns[dateKey] = { categories: new Set(), minutes: 0 };
      }
      dailyBreakdowns[dateKey].categories.add(s.category);
      dailyBreakdowns[dateKey].minutes += mins;
    });

    // Streaks now come from the shared util so Stats and Achievements can never disagree.
    const { currentStreak, longestStreak } = computeStreaks(sessions);

    const maxCategoriesInOneDay = Math.max(...Object.values(dailyBreakdowns).map((d) => d.categories.size), 0);
    const multiCategoryDays = Object.values(dailyBreakdowns).filter((d) => d.categories.size >= 3).length;
    const categoriesTriedCount = Object.keys(categoryTotals).length;

    return {
      totalMinutes,
      sessionsCount: sessions.length,
      categoryTotals,
      longestSession,
      earlyBirdSessions,
      nightOwlSessions,
      weekendSessions,
      currentStreak,
      longestStreak,
      maxCategoriesInOneDay,
      multiCategoryDays,
      sessionsUnder10MinCount,
      sessionsUnder5MinCount,
      longSessionCount90,
      categoriesTriedCount,
    };
  }, [sessions]);

  // --- 2. GENERATE ACHIEVEMENTS ---
  const achievements = useMemo(() => {
    const list = [];

    // --- GROUP A: THE STREAK BEASTS (15 Badges) ---
    const streakMilestones = [3, 5, 7, 10, 14, 21, 30, 45, 60, 75, 90, 120, 150, 200, 365];
    const streakTitles = [
      "Spark Starter", "Habit Builder", "Weekly Warrior", "Double Digits", "Fortnight Fighter",
      "Three Weeks Strong", "Local Legend", "Unstoppable Force", "Immovable Object", "Habit Ascendant",
      "Quarter-Year Quest", "Zen Master", "Sentient Machine", "Demi-God", "The Eternal Calendar"
    ];
    const bestStreak = Math.max(stats.currentStreak, stats.longestStreak);
    streakMilestones.forEach((days, i) => {
      list.push({
        id: `streak_${days}`,
        type: "streak",
        title: streakTitles[i],
        desc: `Maintain a continuous study streak of ${days} days.`,
        icon: days >= 90 ? "🔥" : days >= 30 ? "⚡" : "🕯️",
        unlocked: bestStreak >= days,
        progressText: `${bestStreak}/${days} days`
      });
    });

    // --- GROUP B: LIFETIME MILESTONES (15 Badges) ---
    const timeMilestones = [100, 250, 500, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000];
    const timeTitles = [
      "Page Turner", "Deep Diver", "Cognitive Pioneer", "Kilominute Club", "Skill Explorer",
      "System Overlord", "Hyper-Focused", "Ascended Scholar", "Grand Archmage", "The Library's Keeper",
      "Universal Translator", "Cognitive Titan", "Sentient Archive", "Absolute Genius", "Transcendent Being"
    ];
    timeMilestones.forEach((mins, i) => {
      list.push({
        id: `time_${mins}`,
        type: "milestone",
        title: timeTitles[i],
        desc: `Log a total of ${mins.toLocaleString()} lifetime study minutes.`,
        icon: "🧠",
        unlocked: stats.totalMinutes >= mins,
        progressText: `${Math.round(stats.totalMinutes).toLocaleString()}/${mins.toLocaleString()} mins`
      });
    });

    // --- GROUP C: CATEGORY SPECIALISTS (10 Categories x 5 Tiers = 50 Badges) ---
    const categories = Object.keys(CATEGORY_ICONS);
    const catTiers = [60, 300, 1200, 3000, 6000]; // 1hr, 5hrs, 20hrs, 50hrs, 100hrs
    const catTierTitles = ["Initiate", "Practitioner", "Devotee", "Master", "Monarch"];

    categories.forEach((cat) => {
      const catMins = stats.categoryTotals[cat] || 0;
      const icon = CATEGORY_ICONS[cat];
      catTiers.forEach((mins, idx) => {
        list.push({
          id: `cat_${cat.toLowerCase().replace(" ", "_")}_${mins}`,
          type: "specialty",
          title: `${cat} ${catTierTitles[idx]}`,
          desc: `Spend ${mins / 60} hour(s) (${mins} mins) training your ${cat} abilities.`,
          icon,
          unlocked: catMins >= mins,
          progressText: `${Math.round(catMins)}/${mins} mins`
        });
      });
    });

    // --- GROUP D: QUIRKY & ODDLY SPECIFIC CHALLENGES ---
    const quirkyChallenges = [
      {
        id: "midnight_owl_1",
        title: "Midnight Owl",
        desc: "Log 5 separate sessions between midnight and 5:00 AM.",
        icon: "🦉",
        unlocked: stats.nightOwlSessions >= 5,
        progressText: `${stats.nightOwlSessions}/5 sessions`
      },
      {
        id: "vampire_habit",
        title: "Vampire Habit",
        desc: "Log 25 sessions under the safety of pitch darkness (12 AM - 5 AM).",
        icon: "🧛",
        unlocked: stats.nightOwlSessions >= 25,
        progressText: `${stats.nightOwlSessions}/25 sessions`
      },
      {
        id: "insomniac",
        title: "Insomniac",
        desc: "Log 50 sessions in the dead of night (12 AM - 5 AM). Sleep is for the weak.",
        icon: "🌑",
        unlocked: stats.nightOwlSessions >= 50,
        progressText: `${stats.nightOwlSessions}/50 sessions`
      },
      {
        id: "early_bird_1",
        title: "Worm Destroyer",
        desc: "Log 5 early morning sessions between 5:00 AM and 9:00 AM.",
        icon: "🪱",
        unlocked: stats.earlyBirdSessions >= 5,
        progressText: `${stats.earlyBirdSessions}/5 sessions`
      },
      {
        id: "rooster_status",
        title: "Rooster Energy",
        desc: "Log 30 early morning sessions (5 AM - 9 AM) before the rest of the world wakes.",
        icon: "🐓",
        unlocked: stats.earlyBirdSessions >= 30,
        progressText: `${stats.earlyBirdSessions}/30 sessions`
      },
      {
        id: "weekend_warrior",
        title: "Weekend Warrior",
        desc: "Complete 15 total sessions exclusively on Saturdays and Sundays.",
        icon: "🏹",
        unlocked: stats.weekendSessions >= 15,
        progressText: `${stats.weekendSessions}/15 sessions`
      },
      {
        id: "weekend_recluse",
        title: "Weekend Recluse",
        desc: "Log 50 sessions exclusively on Saturdays and Sundays. Who needs a social life?",
        icon: "🏕️",
        unlocked: stats.weekendSessions >= 50,
        progressText: `${stats.weekendSessions}/50 sessions`
      },
      {
        id: "iron_mind",
        title: "Iron Mind",
        desc: "Complete a grueling single study session lasting over 2 hours (120 mins).",
        icon: "🏋️",
        unlocked: stats.longestSession >= 120,
        progressText: `Longest: ${Math.round(stats.longestSession)}/120 mins`
      },
      {
        id: "brain_melt",
        title: "Brain Melt",
        desc: "Complete a massive single session lasting over 3 hours (180 mins). Have some tea.",
        icon: "🫠",
        unlocked: stats.longestSession >= 180,
        progressText: `Longest: ${Math.round(stats.longestSession)}/180 mins`
      },
      {
        id: "one_more_round",
        title: "One More Round",
        desc: "Push through a single session of 4 hours (240 mins) or more without stopping.",
        icon: "🥵",
        unlocked: stats.longestSession >= 240,
        progressText: `Longest: ${Math.round(stats.longestSession)}/240 mins`
      },
      {
        id: "marathoner",
        title: "Marathoner",
        desc: "Complete 10 individual sessions that each last 90 minutes or longer.",
        icon: "🏃",
        unlocked: stats.longSessionCount90 >= 10,
        progressText: `${stats.longSessionCount90}/10 long sessions`
      },
      {
        id: "chaos_learner_1",
        title: "Chaos Learner",
        desc: "Log 4 different category activities on the same calendar day.",
        icon: "🌪️",
        unlocked: stats.maxCategoriesInOneDay >= 4,
        progressText: `${stats.maxCategoriesInOneDay}/4 categories`
      },
      {
        id: "omni_learner",
        title: "Avatar State",
        desc: "Log 6 completely unique learning categories on the exact same calendar day.",
        icon: "🌌",
        unlocked: stats.maxCategoriesInOneDay >= 6,
        progressText: `${stats.maxCategoriesInOneDay}/6 categories`
      },
      {
        id: "heavy_rotator",
        title: "Heavy Rotator",
        desc: "Achieve 15 separate days where you train 3 or more different categories.",
        icon: "🔄",
        unlocked: stats.multiCategoryDays >= 15,
        progressText: `${stats.multiCategoryDays}/15 days`
      },
      {
        id: "category_explorer",
        title: "Jack of All Trades",
        desc: "Log at least some time in all 10 available categories.",
        icon: "🗺️",
        unlocked: stats.categoriesTriedCount >= 10,
        progressText: `${stats.categoriesTriedCount}/10 categories tried`
      },
      {
        id: "listening_biased",
        title: "All Ears",
        desc: "Log over 1,000 minutes of Listening but less than 10 minutes of Speaking.",
        icon: "👂",
        unlocked: (stats.categoryTotals["Listening"] || 0) >= 1000 && (stats.categoryTotals["Speaking"] || 0) < 10,
        progressText: `List: ${Math.round(stats.categoryTotals["Listening"] || 0)}m, Speak: ${Math.round(stats.categoryTotals["Speaking"] || 0)}m`
      },
      {
        id: "all_talk",
        title: "All Talk, No Action",
        desc: "Log over 1,000 minutes of Speaking/AI Conversation but less than 10 minutes of Writing.",
        icon: "📣",
        unlocked: ((stats.categoryTotals["Speaking"] || 0) + (stats.categoryTotals["AI Conversation"] || 0)) >= 1000 && (stats.categoryTotals["Writing"] || 0) < 10,
        progressText: `Oral: ${Math.round((stats.categoryTotals["Speaking"] || 0) + (stats.categoryTotals["AI Conversation"] || 0))}m, Write: ${Math.round(stats.categoryTotals["Writing"] || 0)}m`
      },
      {
        id: "bookworm",
        title: "Bookworm",
        desc: "Devour 3,000 minutes (50 hours) of Reading practice.",
        icon: "📚",
        unlocked: (stats.categoryTotals["Reading"] || 0) >= 3000,
        progressText: `${Math.round(stats.categoryTotals["Reading"] || 0)}/3000 mins`
      },
      {
        id: "tv_enthusiast",
        title: "TV Enthusiast",
        desc: "Binge 3,000 minutes (50 hours) of TV Shows for \"research\".",
        icon: "📺",
        unlocked: (stats.categoryTotals["TV Shows"] || 0) >= 3000,
        progressText: `${Math.round(stats.categoryTotals["TV Shows"] || 0)}/3000 mins`
      },
      {
        id: "monochrome",
        title: "Laser Focus",
        desc: "Have one single category account for over 85% of your total study time (Min 500 total mins).",
        icon: "🎯",
        unlocked: stats.totalMinutes >= 500 && Object.values(stats.categoryTotals).some((val) => val / stats.totalMinutes > 0.85),
        progressText: stats.totalMinutes >= 500 ? "Validated" : `Mins check: ${Math.round(stats.totalMinutes)}/500`
      },
      {
        id: "equalizer",
        title: "Perfect Balance",
        desc: "Have at least 3 categories with over 200 minutes logged each, within 10% of each other's totals.",
        icon: "⚖️",
        unlocked: (() => {
          const validCats = Object.values(stats.categoryTotals).filter((v) => v >= 200);
          if (validCats.length < 3) return false;
          const max = Math.max(...validCats);
          const min = Math.min(...validCats);
          return (max - min) / max <= 0.10;
        })(),
        progressText: "Needs 3 categories ≥ 200m within a 10% delta"
      },
      {
        id: "pod_castaway",
        title: "Podcast Castaway",
        desc: "Log more than 1,500 minutes of Podcasts.",
        icon: "🏝️",
        unlocked: (stats.categoryTotals["Podcasts"] || 0) >= 1500,
        progressText: `${Math.round(stats.categoryTotals["Podcasts"] || 0)}/1500 mins`
      },
      {
        id: "shadow_clones",
        title: "Shadow Clone Jutsu",
        desc: "Log 1,000 minutes of Shadowing.",
        icon: "👥",
        unlocked: (stats.categoryTotals["Shadowing"] || 0) >= 1000,
        progressText: `${Math.round(stats.categoryTotals["Shadowing"] || 0)}/1000 mins`
      },
      {
        id: "grammar_goblin",
        title: "Grammar Goblin",
        desc: "Log 800 minutes of strict Grammar drills.",
        icon: "👺",
        unlocked: (stats.categoryTotals["Grammar"] || 0) >= 800,
        progressText: `${Math.round(stats.categoryTotals["Grammar"] || 0)}/800 mins`
      },
      {
        id: "vocab_vampire",
        title: "Vocabulary Vampire",
        desc: "Spend 1,000 cumulative minutes draining cards in Vocabulary.",
        icon: "🧛",
        unlocked: (stats.categoryTotals["Vocabulary"] || 0) >= 1000,
        progressText: `${Math.round(stats.categoryTotals["Vocabulary"] || 0)}/1000 mins`
      },
      {
        id: "cyborg_negotiator",
        title: "AI Negotiator",
        desc: "Converse with the Artificial Intelligence for 1,200 minutes.",
        icon: "🦾",
        unlocked: (stats.categoryTotals["AI Conversation"] || 0) >= 1200,
        progressText: `${Math.round(stats.categoryTotals["AI Conversation"] || 0)}/1200 mins`
      },
      {
        id: "speed_runner",
        title: "No Time To Waste",
        desc: "Complete 100 individual micro-sessions (sessions under 10 minutes).",
        icon: "🏎️",
        unlocked: stats.sessionsUnder10MinCount >= 100,
        progressText: `${stats.sessionsUnder10MinCount}/100 speedruns`
      },
      {
        id: "sprinter",
        title: "Sprinter",
        desc: "Rack up 200 lightning-fast micro-sessions under 5 minutes each.",
        icon: "⚡",
        unlocked: stats.sessionsUnder5MinCount >= 200,
        progressText: `${stats.sessionsUnder5MinCount}/200 sprints`
      },
      {
        id: "century_club",
        title: "Century Club",
        desc: "Log 100 total study sessions, of any length, in any category.",
        icon: "💯",
        unlocked: stats.sessionsCount >= 100,
        progressText: `${stats.sessionsCount}/100 sessions`
      },
      {
        id: "half_millennium",
        title: "Half Millennium",
        desc: "Log 500 total study sessions. At this point it's basically a lifestyle.",
        icon: "🎖️",
        unlocked: stats.sessionsCount >= 500,
        progressText: `${stats.sessionsCount}/500 sessions`
      }
    ];

    quirkyChallenges.forEach((badge) => {
      list.push({ ...badge, type: "quirky" });
    });

    return list;
  }, [stats]);

  // --- 3. FILTER LOGIC ---
  const filteredAchievements = useMemo(() => {
    return achievements.filter((badge) => {
      if (activeFilter === "unlocked") return badge.unlocked;
      if (activeFilter === "locked") return !badge.unlocked;
      if (activeFilter === "streaks") return badge.type === "streak";
      if (activeFilter === "milestones") return badge.type === "milestone";
      if (activeFilter === "specialties") return badge.type === "specialty";
      if (activeFilter === "quirky") return badge.type === "quirky";
      return true; // "all"
    });
  }, [achievements, activeFilter]);

  const unlockedCount = useMemo(() => achievements.filter((b) => b.unlocked).length, [achievements]);

  return (
    <div style={{ maxWidth: "750px", margin: "40px auto", padding: "32px 24px", background: "#0f0a1e", color: "#f8fafc", borderRadius: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "950", margin: "0", letterSpacing: "-0.5px" }}>🏆 Badge Room</h1>
        <p style={{ color: "#a5b4fc", fontSize: "14px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "1.5px" }}>The Odd & Challenging Odyssey</p>
      </div>

      {/* Progress Bar & Counter */}
      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "20px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "800" }}>Overall Completion</span>
          <span style={{ fontSize: "18px", fontWeight: "900", color: "#6366f1" }}>
            {unlockedCount} <span style={{ color: "#64748b", fontWeight: "500", fontSize: "14px" }}>/ {achievements.length} Badges</span>
          </span>
        </div>
        <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
          <div style={{ width: `${(unlockedCount / achievements.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: "5px", transition: "width 0.5s ease-out" }} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px", scrollbarWidth: "none" }}>
        {["all", "unlocked", "locked", "streaks", "milestones", "specialties", "quirky"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              background: activeFilter === filter ? "#6366f1" : "rgba(255,255,255,0.03)",
              color: activeFilter === filter ? "#ffffff" : "#94a3b8",
              border: activeFilter === filter ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.05)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap"
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List of Achievements */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredAchievements.map((badge) => (
          <div
            key={badge.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: badge.unlocked ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.01)",
              border: badge.unlocked ? "1px solid rgba(99, 102, 241, 0.15)" : "1px solid rgba(255, 255, 255, 0.02)",
              borderRadius: "16px",
              padding: "16px",
              opacity: badge.unlocked ? 1 : 0.4,
              transition: "all 0.3s ease"
            }}
          >
            {/* Badge Icon circle */}
            <div style={{
              fontSize: "26px",
              filter: badge.unlocked ? "none" : "grayscale(100%)",
              background: badge.unlocked ? "rgba(99, 102, 241, 0.1)" : "rgba(0,0,0,0.2)",
              border: badge.unlocked ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid rgba(255,255,255,0.05)",
              borderRadius: "50%",
              width: "56px",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {badge.icon}
            </div>

            {/* Badge Text details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", color: badge.unlocked ? "#f8fafc" : "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {badge.title}
                </span>
                <span style={{ fontSize: "9px", color: badge.unlocked ? "#22c55e" : "#64748b", fontWeight: "800", letterSpacing: "1px", marginLeft: "8px" }}>
                  {badge.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {badge.desc}
              </p>
              <div style={{ fontSize: "10px", color: badge.unlocked ? "#a5b4fc" : "#64748b", fontStyle: "italic", marginTop: "4.5px", fontWeight: "600" }}>
                {badge.progressText}
              </div>
            </div>
          </div>
        ))}

        {filteredAchievements.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
            No badges found matching your active filter tab. Go unlock some!
          </div>
        )}
      </div>
    </div>
  );
}