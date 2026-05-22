/**
 * Add your audio files to  public/music/
 * Add cover art to         public/music/covers/
 * Then update TRACKS below.
 */
export type Track = {
  id: string;
  title: string;
  artist: string;
  /** Path relative to /public — e.g. "/music/covers/cover1.jpg" */
  cover: string;
  /** Path relative to /public — e.g. "/music/track1.mp3" */
  src: string;
};

export const TRACKS: Track[] = [
  {
    id: "1",
    title: "صوت المطر",
    artist: "",
    cover: "/music/covers/cover1.jpeg",
    src: "/music/music1.mp3",
  },
  {
    id: "2",
    title: "مع هُبوب النودّ يأ تينِي طِيفه اللي مبطي عنه",
    artist: "هادي المري",
    cover: "/music/covers/cover3.jpeg",
    src: "/music/music2.mp3",
  },
  {
    id: "3",
    title: "اغفر لي الزلات",
    artist: "جفران المري",
    cover: "/music/covers/cover2.jpeg",
    src: "/music/music3.mp3",
  },
  
];
