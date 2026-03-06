const TARGET_LINE_COUNT = 300;

const TAUNT_OPENERS = [
  "Your clicking strategy has the urgency of a sleepy snail.",
  "I have seen loading spinners with better reflexes.",
  "Even dial-up internet expected more from you.",
  "Your finger is currently in power-save mode.",
  "Bold of you to call this pace 'trying.'",
  "The button is getting stage fright from your silence.",
  "I asked for action, not interpretive hesitation.",
  "At this speed, moss will finish first.",
  "The button has started writing a goodbye letter.",
  "Your reaction time is sponsored by buffering.",
  "That was almost a click, emotionally speaking.",
  "The global count is waiting on your plot twist.",
  "My pixels are aging while you think about it.",
  "This is less 'fast tap' and more 'annual event.'",
  "Your wrist is clearly negotiating with gravity.",
  "Pressing is legal, you know.",
  "That finger has a lot of opinions and zero follow-through.",
  "You are one click away from competence.",
  "The button believes in you more than I do.",
  "Your hesitation has its own zip code.",
];

const TAUNT_MIDDLES = [
  "Tap me before my confidence evaporates",
  "Give that index finger a purpose",
  "Break the stillness with one brave click",
  "Prove you are not decorative background",
  "Wake the counter from this dramatic pause",
  "Deliver one respectable tap and we move on",
  "Demonstrate pulse, preferably this decade",
  "Show the global feed you are alive",
  "Turn your suspense into button pressure",
  "End this awkward staring contest",
];

const TAUNT_CLOSERS = [
  "and maybe I stop judging.",
  "unless suspense is your favorite sport.",
];

const RESPONSE_OPENERS = [
  "Ouch, that one landed.",
  "Hey, personal space.",
  "Bold click. Mildly impressive.",
  "Direct hit. I felt that in my CSS.",
  "Good tap. Your finger finally clocked in.",
  "You click like a caffeinated squirrel.",
  "Nice swing. My gradient flinched.",
  "That press had main-character energy.",
  "Solid impact. Very dramatic.",
  "Okay, that was unexpectedly efficient.",
  "I heard that click in 4K.",
  "Aggressive. I respect the chaos.",
  "Clean tap. Zero notes.",
  "You clicked like you meant it.",
  "That was fast enough to scare analytics.",
  "I retract one insult.",
  "Excellent poke, tiny menace.",
  "Your finger chose violence.",
  "That tap had confidence.",
  "Impressive. Briefly.",
];

const RESPONSE_MIDDLES = [
  "Try again if you think that was your best",
  "Give me another one and make it louder",
  "Do not stop now, momentum looks good on you",
  "I can take another, probably",
  "Hit me again before your courage expires",
  "Follow that up before the vibe cools down",
  "Run it back and keep the streak alive",
  "You are dangerously close to being consistent",
  "Queue the next tap while you are warmed up",
  "Do it again and call it a training montage",
];

const RESPONSE_CLOSERS = [
  "champ.",
  "speedster.",
];

function buildLines(openers: string[], middles: string[], closers: string[]): string[] {
  const lines: string[] = [];

  for (const opener of openers) {
    for (const middle of middles) {
      for (const closer of closers) {
        lines.push(`${opener} ${middle} ${closer}`);

        if (lines.length === TARGET_LINE_COUNT) {
          return lines;
        }
      }
    }
  }

  throw new Error(
    `Insufficient phrase permutations: expected ${TARGET_LINE_COUNT}, got ${lines.length}.`,
  );
}

/** 300 rotating taunts to provoke interaction. */
export const TAUNT_LINES = buildLines(
  TAUNT_OPENERS,
  TAUNT_MIDDLES,
  TAUNT_CLOSERS,
);

/** 300 rotating responses shown immediately after a press. */
export const PRESS_RESPONSE_LINES = buildLines(
  RESPONSE_OPENERS,
  RESPONSE_MIDDLES,
  RESPONSE_CLOSERS,
);
