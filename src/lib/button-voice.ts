const TARGET_LINE_COUNT = 300;
const MAX_WORDS_PER_LINE = 15;

const TAUNT_LEADS = [
  "Tap now.",
  "Click already.",
  "Press the button.",
  "Wake up, tap.",
  "Move that finger.",
  "Stop spectating, tap.",
  "Go on, press.",
  "Quit hovering, click.",
  "You can do one click.",
  "Prove me wrong, tap.",
  "Try pressing once.",
  "Less staring, more tapping.",
  "Take the shot, click.",
  "Yes, this means you.",
  "End the suspense, tap.",
  "Make the counter move.",
  "Hit it, hotshot.",
  "Show some reflexes.",
  "Press before retirement.",
  "One click, hero.",
];

const TAUNT_SUBJECTS = [
  "a DMV line",
  "hotel Wi-Fi",
  "a budget airline app",
  "an office printer",
  "a mall escalator",
  "a coffee shop queue",
  "a frozen laptop",
  "an old GPS",
  "a ticket kiosk",
  "self-checkout",
  "an elevator door",
  "a parking app",
  "a delivery tracker",
  "a support chatbot",
  "an airport shuttle",
  "a crossing signal",
  "a streaming app",
  "a crowded turnstile",
  "a library computer",
  "a theme park line",
];

const TAUNT_CONDITIONS = [
  "on Monday morning",
  "during lunch rush",
  "with one-bar signal",
  "after software updates",
  "during thunderstorms",
  "with low battery",
  "before first coffee",
  "on holiday weekends",
  "while people stare",
  "with sticky buttons",
  "after two reboots",
  "while buffering forever",
  "during maintenance windows",
  "on public Wi-Fi",
  "with popups open",
];

const RESPONSE_LEADS = [
  "Ouch, finally.",
  "There it is.",
  "Nice hit.",
  "Bold tap.",
  "Okay, good.",
  "You clicked.",
  "That landed.",
  "Clean strike.",
  "Good swing.",
  "Sharp move.",
  "Solid hit.",
  "That hurt.",
  "Big energy.",
  "Fast hands.",
  "Heavy tap.",
  "Real effort.",
  "Strong click.",
  "Great poke.",
  "Wild timing.",
  "Now talking.",
];

const RESPONSE_SUBJECTS = [
  "a raccoon on espresso",
  "a drummer in traffic",
  "a toddler with drumsticks",
  "a stunt driver in flipflops",
  "a gamer in overtime",
  "a chef after espresso",
  "a goalie in panic",
  "a barista in rushhour",
  "a ninja with hiccups",
  "a pirate chasing payday",
  "a squirrel with deadlines",
  "a detective in sitcom mode",
  "a boxer chasing confetti",
  "a referee in rollerskates",
  "a surfer on carpet",
  "a magician missing rehearsal",
  "a coach yelling poetry",
  "a robot with sarcasm",
  "a comedian in finalsweek",
  "a taxi driver sidequesting",
];

const RESPONSE_CONDITIONS = [
  "during fire drills",
  "on one-hour sleep",
  "with alarms blaring",
  "after skipped breakfast",
  "while cameras roll",
  "with upside-down maps",
  "during surprise overtime",
  "on borrowed patience",
  "with untied laces",
  "after bad ideas",
  "while music buffers",
  "with crashing tabs",
  "during peak chaos",
  "with no warmup",
  "under fluorescent lights",
];

function countWords(line: string): number {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function buildPunchlines(subjects: string[], conditions: string[]): string[] {
  const lines: string[] = [];
  for (const subject of subjects) {
    for (const condition of conditions) {
      lines.push(`${subject} ${condition}`);
    }
  }

  if (lines.length !== TARGET_LINE_COUNT) {
    throw new Error(
      `Punchline count mismatch: expected ${TARGET_LINE_COUNT}, got ${lines.length}.`,
    );
  }

  return lines;
}

function buildTaunts(leads: string[], punchlines: string[]): string[] {
  const lines = punchlines.map((punchline, index) => {
    const lead = leads[index % leads.length];
    return `${lead} You're slower than ${punchline}.`;
  });

  lines.forEach((line) => {
    if (countWords(line) > MAX_WORDS_PER_LINE) {
      throw new Error(
        `Taunt exceeds ${MAX_WORDS_PER_LINE} words: "${line}" (${countWords(line)} words).`,
      );
    }
  });

  return lines;
}

function buildResponses(leads: string[], punchlines: string[]): string[] {
  const lines = punchlines.map((punchline, index) => {
    const lead = leads[index % leads.length];
    return `${lead} You hit like ${punchline}.`;
  });

  lines.forEach((line) => {
    if (countWords(line) > MAX_WORDS_PER_LINE) {
      throw new Error(
        `Response exceeds ${MAX_WORDS_PER_LINE} words: "${line}" (${countWords(line)} words).`,
      );
    }
  });

  return lines;
}

/** 300 rotating taunts to provoke interaction. */
export const TAUNT_LINES = buildTaunts(
  TAUNT_LEADS,
  buildPunchlines(TAUNT_SUBJECTS, TAUNT_CONDITIONS),
);

/** 300 rotating responses shown immediately after a press. */
export const PRESS_RESPONSE_LINES = buildResponses(
  RESPONSE_LEADS,
  buildPunchlines(RESPONSE_SUBJECTS, RESPONSE_CONDITIONS),
);
