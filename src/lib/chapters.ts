export type ChapterId = "within" | "inner" | "thought" | "distance" | "encounter" | "touch" | "connection" | "afterglow";
export interface Chapter {
  id: ChapterId; label: string; title: string[]; body: string[]; image: string; alt: string;
  desktopHeight: number; mobileHeight: number; focalPoint: string;
}
export const chapters: Chapter[] = [
  { id: "within", label: "The world within", title: ["A world", "within."], body: ["You have never been just one thing.", "You are everything you have ever felt."], image: "iris", alt: "An intimate close-up of a hazel eye, its iris illuminated by warm light.", desktopHeight: 240, mobileHeight: 170, focalPoint: "68% 48%" },
  { id: "inner", label: "An inner universe", title: ["Infinite.", "And entirely", "yours."], body: ["Every thought. Every almost.", "Every version of you no one has met."], image: "thought", alt: "Layers of a woman's reflection emerge from darkness.", desktopHeight: 300, mobileHeight: 220, focalPoint: "65% 45%" },
  { id: "thought", label: "What we carry", title: ["Some things", "never find words."], body: ["Not as stories we tell.", "As feelings we remember."], image: "memory-room", alt: "Evening light in an empty room, remembered long after leaving.", desktopHeight: 740, mobileHeight: 560, focalPoint: "58% 50%" },
  { id: "distance", label: "The distance", title: ["So close.", "So far."], body: ["Of all the space between us,", "the last little distance is the hardest."], image: "encounter", alt: "Two people stand apart in the dark, facing one another.", desktopHeight: 260, mobileHeight: 200, focalPoint: "50% 45%" },
  { id: "encounter", label: "Being seen", title: ["Then, someone", "sees you."], body: ["Not the person you try to be.", "The person you already are."], image: "encounter", alt: "A woman and a man meet each other's gaze across a quiet interval.", desktopHeight: 260, mobileHeight: 190, focalPoint: "50% 45%" },
  { id: "touch", label: "A small beginning", title: ["It starts", "with a little", "courage."], body: ["You don't have to have the words.", "You only have to reach."], image: "touch", alt: "Two hands reach toward one another; a tiny gap remains between their fingertips.", desktopHeight: 280, mobileHeight: 210, focalPoint: "50% 50%" },
  { id: "connection", label: "A shared light", title: ["Something", "opens."], body: ["Two inner worlds.", "For a moment, one shared light."], image: "connection", alt: "Warm light connects two people and illuminates both faces.", desktopHeight: 380, mobileHeight: 280, focalPoint: "50% 45%" },
  { id: "afterglow", label: "What remains", title: ["We leave", "each other", "changed."], body: ["A little of you. A little of me.", "Something neither of us was before."], image: "afterglow", alt: "Two people stand together in warm light and look toward the same horizon.", desktopHeight: 160, mobileHeight: 140, focalPoint: "60% 45%" },
];
export const soundtrack = { src: "/audio/inner-light-instrumental.mp3", title: "Inner Light", artists: "Elderbrook & Bob Moses", gain: 0.35 };
