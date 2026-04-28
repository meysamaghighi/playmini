"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Song {
  artist: string;
  title: string;
  year: number;
}

interface TriviaQ {
  question: string;
  answer: string | null;
}

// Song database - 300 songs spanning 1956-2022
const SONGS: Song[] = [
  { artist: "DeBarge", title: "Rhythm Of The Night", year: 1985 },
  { artist: "blink-182", title: "All The Small Things", year: 1999 },
  { artist: "Crazy Town", title: "Butterfly", year: 1999 },
  { artist: "Twisted Sister", title: "We're Not Gonna Take It", year: 1984 },
  { artist: "Haddaway", title: "What Is Love", year: 1993 },
  { artist: "Diana Ross", title: "I'm Coming Out", year: 1980 },
  { artist: "Peter Cetera", title: "Glory of Love", year: 1986 },
  { artist: "The Chainsmokers & Coldplay", title: "Something Just Like This", year: 2017 },
  { artist: "Zara Larsson & MNEK", title: "Never Forget You", year: 2017 },
  { artist: "Sweetbox", title: "Everything's Gonna Be Alright", year: 1998 },
  { artist: "Seal", title: "Kiss from a Rose", year: 1994 },
  { artist: "Swedish House Mafia", title: "Don't You Worry Child", year: 2012 },
  { artist: "Wilson Pickett", title: "In the Midnight Hour", year: 1965 },
  { artist: "PSY", title: "Gangnam Style", year: 2012 },
  { artist: "ABBA", title: "Take A Chance On Me", year: 1977 },
  { artist: "Dr. Alban", title: "It's My Life", year: 1992 },
  { artist: "The Hives", title: "Hate To Say I Told You So", year: 2000 },
  { artist: "Caesars", title: "Jerk It Out", year: 2002 },
  { artist: "KISS", title: "I Was Made For Lovin' You", year: 1979 },
  { artist: "Destiny's Child", title: "Survivor", year: 2001 },
  { artist: "Ace of Base", title: "All That She Wants", year: 1993 },
  { artist: "Taylor Swift", title: "Anti-Hero", year: 2022 },
  { artist: "Mr. President", title: "Coco Jamboo", year: 1996 },
  { artist: "Nancy Sinatra", title: "Bang Bang", year: 1966 },
  { artist: "Passenger", title: "Let Her Go", year: 2012 },
  { artist: "Deep Blue Something", title: "Breakfast At Tiffany's", year: 1993 },
  { artist: "Foreigner", title: "I Want to Know What Love Is", year: 1984 },
  { artist: "Kenny Rogers", title: "The Gambler", year: 1978 },
  { artist: "Radiohead", title: "Creep", year: 1993 },
  { artist: "Maroon 5", title: "This Love", year: 2002 },
  { artist: "Queen", title: "Bohemian Rhapsody", year: 1975 },
  { artist: "Survivor", title: "Eye of the Tiger", year: 1982 },
  { artist: "Tears For Fears", title: "Everybody Wants To Rule The World", year: 1985 },
  { artist: "Technotronic", title: "Pump Up The Jam", year: 1989 },
  { artist: "Cypress Hill", title: "Insane in the Brain", year: 1993 },
  { artist: "Little Richard", title: "Tutti Frutti", year: 1957 },
  { artist: "Chubby Checker", title: "Let's Twist Again", year: 1961 },
  { artist: "The Righteous Brothers", title: "Unchained Melody", year: 1965 },
  { artist: "The Rolling Stones", title: "(I Can't Get No) Satisfaction", year: 1965 },
  { artist: "Whitesnake", title: "Here I Go Again", year: 1987 },
  { artist: "The Corrs", title: "What Can I Do", year: 1998 },
  { artist: "Moby", title: "Porcelain", year: 1999 },
  { artist: "The Darkness", title: "I Believe in a Thing Called Love", year: 2003 },
  { artist: "Amy Macdonald", title: "This Is The Life", year: 2007 },
  { artist: "Hozier", title: "Take Me To Church", year: 2014 },
  { artist: "Zedd & Maren Morris", title: "The Middle", year: 2018 },
  { artist: "Ariana Grande", title: "no tears left to cry", year: 2018 },
  { artist: "First Aid Kit", title: "My Silver Lining", year: 2014 },
  { artist: "Simple Minds", title: "Don't You (Forget About Me)", year: 1985 },
  { artist: "The Pussycat Dolls", title: "Don't Cha", year: 2005 },
  { artist: "Gwen Stefani", title: "Hollaback Girl", year: 2004 },
  { artist: "Etta James", title: "At Last", year: 1960 },
  { artist: "Bob Dylan", title: "Knockin' On Heaven's Door", year: 1973 },
  { artist: "John Denver", title: "Take Me Home, Country Roads", year: 1971 },
  { artist: "The Calling", title: "Wherever You Will Go", year: 2001 },
  { artist: "SNAP!", title: "Rhythm Is A Dancer", year: 1992 },
  { artist: "Savage Garden", title: "To the Moon & Back", year: 1997 },
  { artist: "Shaggy", title: "It Wasn't Me", year: 2000 },
  { artist: "Marvin Gaye", title: "Ain't No Mountain High Enough", year: 1967 },
  { artist: "Al Green", title: "Let's Stay Together", year: 1972 },
  { artist: "Otis Redding", title: "(Sittin' On) the Dock of the Bay", year: 1968 },
  { artist: "The Tokens", title: "The Lion Sleeps Tonight", year: 1961 },
  { artist: "The Supremes", title: "Baby Love", year: 1964 },
  { artist: "Bee Gees", title: "Stayin' Alive", year: 1977 },
  { artist: "Louis Armstrong", title: "What A Wonderful World", year: 1968 },
  { artist: "Run-D.M.C. & Aerosmith", title: "Walk This Way", year: 1986 },
  { artist: "Mr. Big", title: "To Be With You", year: 1991 },
  { artist: "American Authors", title: "Best Day Of My Life", year: 2014 },
  { artist: "The Buggles", title: "Video Killed The Radio Star", year: 1979 },
  { artist: "Frank Sinatra", title: "Fly Me To The Moon", year: 1964 },
  { artist: "Eric Clapton", title: "I Shot The Sheriff", year: 1974 },
  { artist: "Neil Young", title: "Heart Of Gold", year: 1972 },
  { artist: "MAGIC!", title: "Rude", year: 2014 },
  { artist: "Train", title: "Drops of Jupiter", year: 2001 },
  { artist: "Los Del Rio", title: "Macarena", year: 1996 },
  { artist: "Coolio", title: "Gangsta's Paradise", year: 1995 },
  { artist: "Belinda Carlisle", title: "Heaven Is A Place On Earth", year: 1987 },
  { artist: "UB40", title: "Red Red Wine", year: 1983 },
  { artist: "Depeche Mode", title: "Just Can't Get Enough", year: 1981 },
  { artist: "Van Morrison", title: "Brown Eyed Girl", year: 1967 },
  { artist: "Bill Withers", title: "Ain't No Sunshine", year: 1971 },
  { artist: "Led Zeppelin", title: "Stairway to Heaven", year: 1971 },
  { artist: "Pink Floyd", title: "Another Brick In The Wall", year: 1979 },
  { artist: "AC/DC", title: "Thunderstruck", year: 1990 },
  { artist: "Bon Jovi", title: "Livin' On A Prayer", year: 1986 },
  { artist: "Harry Belafonte", title: "Banana Boat (Day-O)", year: 1956 },
  { artist: "Pet Shop Boys", title: "Go West", year: 1993 },
  { artist: "Spandau Ballet", title: "True", year: 1983 },
  { artist: "Alice Cooper", title: "Poison", year: 1989 },
  { artist: "Bryan Adams", title: "Summer Of '69", year: 1984 },
  { artist: "The Beatles", title: "Don't Let Me Down", year: 1969 },
  { artist: "Ed Sheeran", title: "Bad Habits", year: 2021 },
  { artist: "Harry Styles", title: "As It Was", year: 2022 },
  { artist: "Kate Bush", title: "Running Up That Hill", year: 1985 },
  { artist: "Post Malone", title: "rockstar", year: 2018 },
  { artist: "Janis Joplin", title: "Mercedes Benz", year: 1971 },
  { artist: "O-Zone", title: "Dragostea din tei", year: 2004 },
  { artist: "Anastacia", title: "I'm Outta Love", year: 2000 },
  { artist: "Joan Osborne", title: "One Of Us", year: 1995 },
  { artist: "Kim Wilde", title: "Kids In America", year: 1981 },
  { artist: "All Saints", title: "Pure Shores", year: 2000 },
  { artist: "Nickelback", title: "Rockstar", year: 2005 },
  { artist: "Roxette", title: "Dressed For Success", year: 1988 },
  { artist: "Bobby McFerrin", title: "Don't Worry Be Happy", year: 1988 },
  { artist: "LMFAO", title: "Party Rock Anthem", year: 2011 },
  { artist: "The Bangles", title: "Eternal Flame", year: 1988 },
  { artist: "Fatboy Slim", title: "The Rockafeller Skank", year: 1998 },
  { artist: "Sam Smith", title: "Stay With Me", year: 2014 },
  { artist: "Junior Senior", title: "Move Your Feet", year: 2002 },
  { artist: "Major Lazer & MO", title: "Lean On", year: 2015 },
  { artist: "2Pac & Dr. Dre", title: "California Love", year: 1995 },
  { artist: "Europe", title: "The Final Countdown", year: 1986 },
  { artist: "Midnight Oil", title: "Beds Are Burning", year: 1987 },
  { artist: "U2", title: "With Or Without You", year: 1987 },
  { artist: "Avicii", title: "Wake Me Up", year: 2013 },
  { artist: "Simon & Garfunkel", title: "Mrs. Robinson", year: 1968 },
  { artist: "Jennifer Rush", title: "The Power of Love", year: 1984 },
  { artist: "The Troggs", title: "Wild Thing", year: 1966 },
  { artist: "Dexys Midnight Runners", title: "Come On Eileen", year: 1982 },
  { artist: "Fall Out Boy", title: "Centuries", year: 2015 },
  { artist: "Panic! At The Disco", title: "High Hopes", year: 2018 },
  { artist: "Flo Rida", title: "Good Feeling", year: 2012 },
  { artist: "Wiz Khalifa", title: "See You Again", year: 2015 },
  { artist: "USHER", title: "Yeah!", year: 2004 },
  { artist: "Missy Elliott", title: "Get Ur Freak On", year: 2001 },
  { artist: "Foster The People", title: "Pumped Up Kicks", year: 2011 },
  { artist: "Snoop Dogg", title: "Drop It Like It's Hot", year: 2004 },
  { artist: "CeeLo Green", title: "Forget You", year: 2010 },
  { artist: "The Lumineers", title: "Ho Hey", year: 2012 },
  { artist: "Capital Cities", title: "Safe And Sound", year: 2013 },
  { artist: "Peter Bjorn and John", title: "Young Folks", year: 2006 },
  { artist: "Ne-Yo", title: "So Sick", year: 2006 },
  { artist: "Jason Mraz", title: "I'm Yours", year: 2008 },
  { artist: "Colbie Caillat", title: "Bubbly", year: 2007 },
  { artist: "Alice Deejay", title: "Better Off Alone", year: 1999 },
  { artist: "Alesso & Tove Lo", title: "Heroes", year: 2015 },
  { artist: "Galantis", title: "Runaway (U & I)", year: 2015 },
  { artist: "Rednex", title: "Cotton Eye Joe", year: 1994 },
  { artist: "David Guetta", title: "When Love Takes Over", year: 2009 },
  { artist: "Gym Class Heroes", title: "Stereo Hearts", year: 2011 },
  { artist: "Dean Lewis", title: "Be Alright", year: 2018 },
  { artist: "Ava Max", title: "Sweet but Psycho", year: 2018 },
  { artist: "Ella Henderson", title: "Ghost", year: 2014 },
  { artist: "Jess Glynne", title: "Hold My Hand", year: 2015 },
  { artist: "Matchbox Twenty", title: "3AM", year: 1996 },
  { artist: "Bloodhound Gang", title: "Fire Water Burn", year: 1996 },
  { artist: "Del Shannon", title: "Runaway", year: 1961 },
  { artist: "Neil Sedaka", title: "Breaking Up Is Hard to Do", year: 1962 },
  { artist: "Dionne Warwick", title: "Heartbreaker", year: 1982 },
  { artist: "Barbra Streisand", title: "Woman in Love", year: 1980 },
  { artist: "Barry Manilow", title: "Mandy", year: 1974 },
  { artist: "Harry Nilsson", title: "Everybody's Talkin'", year: 1969 },
  { artist: "Jerry Lee Lewis", title: "Great Balls of Fire", year: 1957 },
  { artist: "Daryl Hall & John Oates", title: "Out of Touch", year: 1984 },
  { artist: "Pulp", title: "Common People", year: 1995 },
  { artist: "Sugababes", title: "Push The Button", year: 2005 },
  { artist: "Elton John & Dua Lipa", title: "Cold Heart", year: 2021 },
  { artist: "Jack Harlow", title: "First Class", year: 2022 },
  { artist: "Tove Lo", title: "No One Dies From Love", year: 2022 },
  { artist: "Robyn", title: "Hang with Me", year: 2010 },
  { artist: "X Ambassadors", title: "Renegades", year: 2015 },
  { artist: "Dada Life", title: "Kick Out The Epic Motherf**ker", year: 2012 },
  { artist: "Vanessa Amorosi", title: "Absolutely Everybody", year: 2000 },
  { artist: "Duck Sauce", title: "Barbra Streisand", year: 2010 },
  { artist: "Kris Kross", title: "Jump", year: 1992 },
  { artist: "iNi Kamoze", title: "Here Comes the Hotstepper", year: 1994 },
  { artist: "Inner Circle", title: "Sweat (A La La La La Long)", year: 1993 },
  { artist: "Santana", title: "Maria Maria", year: 1999 },
  { artist: "Patrick Swayze", title: "She's Like the Wind", year: 1987 },
  { artist: "Ja Rule & Ashanti", title: "Always On Time", year: 2001 },
  { artist: "Baby Bash", title: "Suga Suga", year: 2003 },
  { artist: "Diddy & Faith Evans", title: "I'll Be Missing You", year: 1997 },
  { artist: "Cornershop", title: "Brimful of Asha", year: 1997 },
  { artist: "White Town", title: "Your Woman", year: 1997 },
  { artist: "The Cardigans", title: "Erase / Rewind", year: 1998 },
  { artist: "Jessica Folcker", title: "How Will I Know", year: 1998 },
  { artist: "Mary Mary", title: "Shackles (Praise You)", year: 2000 },
  { artist: "Outlandish", title: "Aicha", year: 2003 },
  { artist: "Juanes", title: "La Camisa Negra", year: 2004 },
  { artist: "MGMT", title: "Kids", year: 2007 },
  { artist: "The Ting Tings", title: "That's Not My Name", year: 2008 },
  { artist: "Mando Diao", title: "Dance With Somebody", year: 2009 },
  { artist: "Seinabo Sey", title: "Younger", year: 2015 },
  { artist: "Fifth Harmony", title: "Worth It", year: 2015 },
  { artist: "Maggie Lindemann", title: "Pretty Girl", year: 2016 },
  { artist: "Powfu", title: "death bed (coffee for your head)", year: 2020 },
];

// Custom trivia for notable songs (ported from original question bank)
const TRIVIA_BANK: Record<string, TriviaQ[]> = {
  "DeBarge|Rhythm Of The Night": [
    { question: "Which famous Motown founder mentored the DeBarge family early in their career?", answer: "Berry Gordy Jr. discovered and mentored the DeBarge family." },
    { question: "Name another DeBarge hit from the 1980s besides this song.", answer: "'Who's Holding Donna Now' and 'All This Love' were other major hits." },
    { question: "Which DeBarge sibling later had a successful solo career?", answer: "El DeBarge had the most successful solo career in the late 1980s." },
  ],
  "blink-182|All The Small Things": [
    { question: "Which album featuring this song helped bring pop-punk into the mainstream?", answer: "'Enema of the State' (1999) was their breakthrough album." },
    { question: "What was blink-182 particularly known for in their stage persona?", answer: "Their humorous, irreverent lyrics and juvenile comedy on stage." },
    { question: "Which band member temporarily left and later rejoined the group?", answer: "Tom DeLonge left in 2015 and rejoined in 2022." },
  ],
  "Crazy Town|Butterfly": [
    { question: "Which classic rock band was sampled in this song?", answer: "Red Hot Chili Peppers' 'Pretty Little Ditty' was sampled." },
    { question: "Why is Crazy Town often described as a one-hit wonder?", answer: "They never replicated this song's massive international success." },
    { question: "Which musical genres were blended in Crazy Town's sound?", answer: "Rap rock, nu metal, and alternative hip hop." },
  ],
  "Twisted Sister|We're Not Gonna Take It": [
    { question: "Who was the frontman known for defending metal music before the U.S. Senate?", answer: "Dee Snider famously testified before the U.S. Senate in 1985." },
    { question: "What visual style made Twisted Sister instantly recognizable on MTV?", answer: "Elaborate makeup, teased hair, and glam metal costumes." },
    { question: "Why did this song become an anthem beyond just heavy metal fans?", answer: "Its rebellious message resonated universally with youth culture." },
  ],
  "Haddaway|What Is Love": [
    { question: "Which European dance music wave helped make this a global hit?", answer: "The Eurodance movement of the early 1990s." },
    { question: "What pop-culture moment helped revive this song's popularity?", answer: "'A Night at the Roxbury' (1998) and internet memes." },
    { question: "In which decade did Haddaway dominate international charts?", answer: "The 1990s, particularly 1993-1994." },
  ],
  "Diana Ross|I'm Coming Out": [
    { question: "Which legendary disco-era producers were behind this song?", answer: "Nile Rodgers and Bernard Edwards of Chic produced it." },
    { question: "Which famous group launched Diana Ross's career?", answer: "The Supremes, Motown's most successful female group." },
    { question: "How did this song reshape Diana Ross's image?", answer: "It marked her transition to a more independent, empowered persona." },
  ],
  "Peter Cetera|Glory of Love": [
    { question: "Which 1980s film featured this song as its theme?", answer: "'The Karate Kid Part II' (1986)." },
    { question: "Which band was Peter Cetera a key member of?", answer: "Chicago, where he was bassist and co-lead vocalist." },
    { question: "What vocal characteristic made Peter Cetera instantly recognizable?", answer: "His distinctive high tenor voice and emotional delivery." },
  ],
  "PSY|Gangnam Style": [
    { question: "What part of Seoul does the song's title refer to?", answer: "Gangnam, an affluent district known for luxury and wealth." },
    { question: "Which platform milestone did this song achieve first?", answer: "First YouTube video to reach 1 billion views (2012)." },
    { question: "How did this song change global awareness of K-pop?", answer: "It introduced K-pop to mainstream Western audiences for the first time." },
  ],
  "ABBA|Take A Chance On Me": [
    { question: "Which Eurovision victory launched ABBA's international career?", answer: "They won Eurovision 1974 with 'Waterloo'." },
    { question: "How did ABBA's songwriting differ from other 1970s pop groups?", answer: "Complex harmonies, layered production, and sophisticated arrangements." },
    { question: "Which two band members were married to each other?", answer: "Agnetha & Bjorn, and Benny & Anni-Frid (both couples later divorced)." },
  ],
  "Queen|Bohemian Rhapsody": [
    { question: "Why was this song considered risky when released?", answer: "Nearly 6 minutes long with no chorus, mixing opera, rock, and ballad." },
    { question: "Which Queen member wrote this entire song?", answer: "Freddie Mercury wrote and composed the entire piece." },
    { question: "How did this track change expectations for rock singles?", answer: "It proved complex, lengthy songs could be commercially successful." },
  ],
  "Avicii|Wake Me Up": [
    { question: "Which two genres were blended in this song's sound?", answer: "EDM/electronic dance music with country/folk elements." },
    { question: "At which festival did Avicii face backlash for debuting this sound?", answer: "Ultra Music Festival 2013." },
    { question: "Why did this song appeal to both EDM and mainstream listeners?", answer: "It combined accessible folk melodies with electronic production." },
  ],
  "Rednex|Cotton Eye Joe": [
    { question: "Which traditional folk song inspired this track?", answer: "The 19th-century American folk song 'Cotton-Eyed Joe'." },
    { question: "What visual theme did Rednex use to stand out?", answer: "Exaggerated American hillbilly/country western costumes." },
    { question: "Why did this become popular at sports events?", answer: "Its high energy, simple dance moves, and infectious beat." },
  ],
  "Foreigner|I Want to Know What Love Is": [
    { question: "Which member was Foreigner's primary songwriter?", answer: "Mick Jones was the band's main songwriter." },
    { question: "What musical element distinguishes this from most rock ballads?", answer: "It prominently features a gospel choir." },
    { question: "Which decade marked Foreigner's peak chart success?", answer: "The late 1970s and 1980s." },
  ],
  "Sweetbox|Everything's Gonna Be Alright": [
    { question: "What classical composer's work was sampled in this song?", answer: "They sampled melodies from Johann Sebastian Bach." },
    { question: "What genre fusion helped Sweetbox stand out?", answer: "They blended pop music with classical themes." },
    { question: "Which decade marked Sweetbox's international breakthrough?", answer: "The late 1990s." },
  ],
  "Seal|Kiss from a Rose": [
    { question: "Which distinctive physical feature became part of Seal's public image?", answer: "Facial scars from lupus." },
    { question: "Which supermodel was Seal famously married to?", answer: "Heidi Klum." },
    { question: "What genre blend best describes Seal's music?", answer: "Soul, pop, and R&B influences." },
  ],
  "Swedish House Mafia|Don't You Worry Child": [
    { question: "Which three DJs make up Swedish House Mafia?", answer: "Axwell, Steve Angello, and Sebastian Ingrosso." },
    { question: "Which genre helped them gain global fame?", answer: "Progressive house and EDM." },
    { question: "Who provided the powerful lead vocals on this track?", answer: "John Martin." },
  ],
};

// Generate fallback trivia for songs without custom questions
function getTrivia(song: Song): TriviaQ[] {
  const key = `${song.artist}|${song.title}`;
  if (TRIVIA_BANK[key]) return TRIVIA_BANK[key];

  const decade = Math.floor(song.year / 10) * 10;
  return [
    { question: `What was happening in ${song.artist}'s career around ${song.year}?`, answer: null },
    { question: `Which musical trends of the ${decade}s influenced this song?`, answer: null },
    { question: `Can you name another hit by ${song.artist}?`, answer: null },
  ];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Mode = "menu" | "trivia" | "timeline";

export default function MusicTrivia() {
  const [mode, setMode] = useState<Mode>("menu");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {mode === "menu" && <MenuScreen onSelect={setMode} />}
      {mode === "trivia" && <TriviaGame onBack={() => setMode("menu")} />}
      {mode === "timeline" && <TimelineGame onBack={() => setMode("menu")} />}
    </div>
  );
}

// ──── Menu ────
function MenuScreen({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-ink mb-2">Music Party Trivia</h1>
      <p className="text-ink-2 mb-8">Test your music knowledge solo or with friends</p>

      <div className="grid gap-4 max-w-sm mx-auto">
        <button
          onClick={() => onSelect("trivia")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-ink font-bold py-5 px-6 rounded-2xl text-lg hover:scale-105 transition-transform"
        >
          <div className="text-2xl mb-1">Music Trivia</div>
          <div className="text-sm opacity-80">Answer questions about songs and artists</div>
        </button>
        <button
          onClick={() => onSelect("timeline")}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-ink font-bold py-5 px-6 rounded-2xl text-lg hover:scale-105 transition-transform"
        >
          <div className="text-2xl mb-1">Timeline Challenge</div>
          <div className="text-sm opacity-80">Place songs in chronological order</div>
        </button>
      </div>
    </div>
  );
}

// ──── Trivia Mode ────
function TriviaGame({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [answered, setAnswered] = useState<boolean[]>([false, false, false]);
  const [gameOver, setGameOver] = useState(false);
  const [songs] = useState(() => shuffle(SONGS).slice(0, 10));
  const [best, setBest] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("pb-music-trivia");
    if (saved) setBest(parseInt(saved, 10));
  }, []);

  const song = songs[round];
  const trivia = song ? getTrivia(song) : [];

  const revealAnswer = (idx: number) => {
    setRevealed((prev) => { const n = [...prev]; n[idx] = true; return n; });
  };

  const markAnswer = (idx: number, correct: boolean) => {
    if (answered[idx]) return;
    setAnswered((prev) => { const n = [...prev]; n[idx] = true; return n; });
    if (correct) setScore((s) => s + 1);
  };

  const nextRound = () => {
    if (round + 1 >= 10) {
      setGameOver(true);
      const final = score;
      if (final > best) {
        setBest(final);
        localStorage.setItem("pb-music-trivia", final.toString());
      }
    } else {
      setRound((r) => r + 1);
      setRevealed([false, false, false]);
      setAnswered([false, false, false]);
    }
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setRevealed([false, false, false]);
    setAnswered([false, false, false]);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-ink mb-2">Game Over!</h2>
        <p className="text-5xl font-black text-purple-400 mb-2">{score}/30</p>
        <p className="text-ink-2 mb-6">Best: {Math.max(score, best)}/30</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-ink font-bold rounded-xl">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 bg-paper-2 hover:bg-paper-2 text-ink font-bold rounded-xl">Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-ink-2 hover:text-ink text-sm">&larr; Back</button>
        <div className="flex gap-4 text-sm">
          <span className="text-ink-2">Round <span className="text-ink font-bold">{round + 1}/10</span></span>
          <span className="text-ink-2">Score <span className="text-purple-400 font-bold">{score}</span></span>
        </div>
      </div>

      {/* Song card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-2xl p-6 mb-6 border border-purple-800/50">
        <p className="text-ink-2 text-sm mb-1">{song.year}</p>
        <h3 className="text-2xl font-bold text-ink">{song.title}</h3>
        <p className="text-purple-300 text-lg">{song.artist}</p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {trivia.map((q, idx) => (
          <div key={idx} className="bg-paper-2 rounded-xl p-5 border border-line">
            <p className="text-ink font-medium mb-3">{q.question}</p>

            {!revealed[idx] ? (
              <button
                onClick={() => revealAnswer(idx)}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                {q.answer ? "Show Answer" : "Discussion Question"}
              </button>
            ) : (
              <div>
                {q.answer ? (
                  <p className="text-ink-2 text-sm bg-paper-2 rounded-lg p-3 mb-3">{q.answer}</p>
                ) : (
                  <p className="text-ink-3 text-sm italic mb-3">Discuss with your group!</p>
                )}
                {!answered[idx] && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAnswer(idx, true)}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-ink text-sm font-bold rounded-lg"
                    >
                      Got it right
                    </button>
                    <button
                      onClick={() => markAnswer(idx, false)}
                      className="px-4 py-1.5 bg-red-600/60 hover:bg-red-600 text-ink text-sm font-bold rounded-lg"
                    >
                      Didn't know
                    </button>
                  </div>
                )}
                {answered[idx] && (
                  <p className="text-ink-3 text-xs">Answered</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={nextRound}
        className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-ink font-bold rounded-xl text-lg transition-colors"
      >
        {round + 1 >= 10 ? "Finish" : "Next Song"}
      </button>
    </div>
  );
}

// ──── Timeline Mode ────
function TimelineGame({ onBack }: { onBack: () => void }) {
  const [placed, setPlaced] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [best, setBest] = useState(0);
  const [showYear, setShowYear] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-music-timeline");
    if (saved) setBest(parseInt(saved, 10));
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = shuffle(SONGS);
    const first = shuffled[0];
    setPlaced([first]);
    setCurrent(shuffled[1]);
    setQueue(shuffled.slice(2));
    setScore(0);
    setLives(3);
    setGameOver(false);
    setFlash(null);
    setShowYear(null);
  };

  const placeSong = (insertIdx: number) => {
    if (!current || gameOver) return;

    // Check if placement is correct
    const newTimeline = [...placed];
    newTimeline.splice(insertIdx, 0, current);

    // Verify order is correct
    let correct = true;
    for (let i = 0; i < newTimeline.length - 1; i++) {
      if (newTimeline[i].year > newTimeline[i + 1].year) {
        correct = false;
        break;
      }
    }

    if (correct) {
      setPlaced(newTimeline);
      setScore((s) => s + 1);
      setFlash("correct");
      setShowYear(current.year);
    } else {
      setLives((l) => l - 1);
      setFlash("wrong");
      setShowYear(current.year);
      // Still place it correctly
      const sorted = [...placed, current].sort((a, b) => a.year - b.year);
      setTimeout(() => setPlaced(sorted), 800);

      if (lives - 1 <= 0) {
        const final = score;
        if (final > best) {
          setBest(final);
          localStorage.setItem("pb-music-timeline", final.toString());
        }
        setTimeout(() => setGameOver(true), 1000);
        return;
      }
    }

    setTimeout(() => {
      setFlash(null);
      setShowYear(null);
    }, 800);

    // Next song
    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(queue.slice(1));
    } else {
      const final = correct ? score + 1 : score;
      if (final > best) {
        setBest(final);
        localStorage.setItem("pb-music-timeline", final.toString());
      }
      setTimeout(() => setGameOver(true), 1000);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-ink mb-2">
          {lives > 0 ? "All Songs Placed!" : "Out of Lives!"}
        </h2>
        <p className="text-5xl font-black text-blue-400 mb-2">{score} placed</p>
        <p className="text-ink-2 mb-6">Best streak: {Math.max(score, best)}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={startNewGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-ink font-bold rounded-xl">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 bg-paper-2 hover:bg-paper-2 text-ink font-bold rounded-xl">Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-ink-2 hover:text-ink text-sm">&larr; Back</button>
        <div className="flex gap-4 text-sm">
          <span className="text-ink-2">Placed <span className="text-blue-400 font-bold">{score}</span></span>
          <span className="text-ink-2">Lives <span className="text-red-400 font-bold">{"*".repeat(lives)}</span></span>
        </div>
      </div>

      {/* Current song to place */}
      {current && (
        <div className={`rounded-2xl p-5 mb-4 border-2 text-center transition-colors ${
          flash === "correct" ? "bg-green-900/40 border-green-500" :
          flash === "wrong" ? "bg-red-900/40 border-red-500" :
          "bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-700/50"
        }`}>
          <p className="text-ink-2 text-sm mb-1">
            {flash && showYear ? `${showYear}` : "Where does this song go?"}
          </p>
          <h3 className="text-xl font-bold text-ink">{current.title}</h3>
          <p className="text-blue-300">{current.artist}</p>
          {flash === "correct" && <p className="text-green-400 font-bold mt-1">Correct!</p>}
          {flash === "wrong" && <p className="text-red-400 font-bold mt-1">Wrong! It was {showYear}</p>}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-1">
        {/* Place before first */}
        <button
          onClick={() => placeSong(0)}
          className="w-full py-2 border-2 border-dashed border-line hover:border-blue-500 hover:bg-blue-950/30 rounded-lg text-ink-3 hover:text-blue-400 text-sm transition-colors"
          disabled={!!flash}
        >
          Place here (before {placed[0]?.year})
        </button>

        {placed.map((song, idx) => (
          <div key={`${song.artist}-${song.title}-${idx}`}>
            {/* Song in timeline */}
            <div className="bg-paper-2 rounded-lg px-4 py-3 border border-line flex justify-between items-center">
              <div>
                <span className="text-ink font-medium text-sm">{song.title}</span>
                <span className="text-ink-3 text-sm ml-2">{song.artist}</span>
              </div>
              <span className="text-ink-2 font-mono text-sm font-bold">{song.year}</span>
            </div>

            {/* Place after this song */}
            <button
              onClick={() => placeSong(idx + 1)}
              className="w-full py-2 border-2 border-dashed border-line hover:border-blue-500 hover:bg-blue-950/30 rounded-lg text-ink-3 hover:text-blue-400 text-sm transition-colors"
              disabled={!!flash}
            >
              Place here {idx < placed.length - 1 ? `(${placed[idx].year}-${placed[idx + 1].year})` : `(after ${song.year})`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
