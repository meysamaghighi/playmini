"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Common 3-7 letter English words dictionary
const DICTIONARY = [
  // 3-letter words
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out", "day",
  "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
  "its", "let", "put", "say", "she", "too", "use", "dad", "mom", "run", "top", "hot", "cut", "lot", "sit",
  "six", "yes", "yet", "age", "ago", "air", "art", "ask", "bad", "bag", "bar", "bed", "big", "bit", "box",
  "buy", "car", "cat", "cup", "dog", "eat", "end", "eye", "far", "few", "fun", "guy", "hit", "job", "kid",
  "lay", "led", "leg", "lie", "low", "may", "met", "nor", "off", "pay", "per", "pop", "red", "row", "sea",
  "set", "ten", "tie", "war", "win", "won", "act", "add", "arm", "ate", "bat", "bet", "bus", "cap",
  "cos", "cow", "cry", "die", "dry", "due", "ear", "fat", "fit", "fly", "fox", "gap", "gas", "god",
  "gun", "hat", "ice", "ill", "key", "law", "lip", "mad", "map", "net", "owe", "pan", "pen", "pet",
  "pot", "raw", "sad", "sat", "sin", "sky", "tea", "van", "via", "wet", "rag", "ram", "ran", "rap",
  "rat", "rib", "rid", "rim", "rip", "rob", "rod", "rot", "rub", "rug", "rut", "sag", "sap", "sew",
  "sir", "sip", "sob", "sod", "son", "sop", "sow", "spy", "sum", "sun", "tab", "tag", "tan", "tap",
  "tar", "tax", "tin", "tip", "toe", "ton", "tow", "toy", "tub", "tug", "vet", "vow", "wag", "web",
  "wed", "wig", "wit", "woe", "wok", "yam", "yap", "yew", "zen", "zip", "zoo", "ore", "oar", "oak",
  "oat", "odd", "ode", "opt", "orb", "owl", "own", "ace", "ado", "aft", "aid", "aim", "ale", "ant",
  "ape", "apt", "arc", "ark", "ash", "awe", "axe", "aye", "ban", "bay", "bee", "bid", "bin", "bog",
  "bon", "boo", "bow", "bud", "bug", "bun", "bur", "cab", "cam", "cob", "cod", "cog", "cop", "cot",
  "cub", "cud", "cue", "cur", "dab", "dam", "dew", "dig", "dim", "din", "dip", "doe", "don", "dot",
  "dub", "dud", "dug", "dun", "duo", "dye", "eel", "egg", "ego", "elk", "elm", "emu", "era", "eve",
  "ewe", "fad", "fan", "fax", "fed", "fee", "fen", "fig", "fin", "fir", "fix", "flu", "foe", "fog",
  "fop", "for", "fry", "fur", "gag", "gal", "gem", "gin", "gnu", "got", "gum", "gut", "gym", "had",
  "hag", "ham", "hap", "hay", "hen", "hew", "hex", "hid", "hog", "hop", "how", "hub", "hue", "hug",
  "hum", "hut", "imp", "ink", "inn", "ion", "ire", "irk", "ivy", "jab", "jag", "jam", "jar", "jaw",
  "jay", "jet", "jig", "jog", "jot", "joy", "jug", "jut", "keg", "kin", "kit", "lab", "lad", "lag",
  "lap", "lax", "lea", "lid", "lit", "log", "lop", "lug", "mob", "mod", "mop", "mow", "mud", "mug",
  "nab", "nag", "nap", "nil", "nip", "nit", "nod", "nor", "not", "nun", "nut", "nub",
  // 4-letter words
  "able", "ache", "acid", "acre", "also", "arch", "area", "army", "away", "back", "bait", "bake", "bald",
  "bale", "ball", "band", "bane", "bang", "bank", "bare", "bark", "barn", "base", "bath", "bead", "beam",
  "bean", "bear", "beat", "been", "beer", "bell", "belt", "bend", "bent", "best", "bike", "bile", "bill",
  "bind", "bird", "bite", "blot", "blow", "blue", "blur", "boar", "boat", "body", "bold", "bolt", "bomb",
  "bond", "bone", "book", "boom", "boot", "bore", "born", "boss", "both", "bout", "bowl", "bulk", "bull",
  "bump", "burn", "bury", "bush", "busy", "buzz", "cafe", "cage", "cake", "calf", "call", "calm", "came",
  "camp", "cape", "card", "care", "cart", "case", "cash", "cast", "cave", "char", "chat", "chin", "chip",
  "chop", "cite", "city", "clad", "clam", "clan", "clap", "claw", "clay", "clip", "clot", "club", "clue",
  "coal", "coat", "code", "coil", "coin", "cold", "colt", "comb", "come", "cone", "cook", "cool", "cope",
  "copy", "cord", "core", "cork", "corn", "cost", "cosy", "coup", "crab", "crew", "crop", "crow", "cube",
  "cult", "curb", "cure", "curl", "cute", "dale", "dame", "damp", "dare", "dark", "dart", "dash", "data",
  "date", "dawn", "dead", "deaf", "deal", "dear", "debt", "deck", "deed", "deem", "deep", "deer", "dent",
  "deny", "desk", "dial", "dice", "diet", "dine", "dire", "dirt", "disc", "dish", "dock", "does", "dome",
  "done", "doom", "door", "dose", "dove", "down", "drag", "draw", "drip", "drop", "drum", "dual", "duck",
  "duel", "duke", "dull", "dumb", "dump", "dune", "dung", "dusk", "dust", "duty", "each", "earl", "earn",
  "ease", "east", "easy", "edge", "edit", "else", "emit", "epic", "euro", "even", "ever", "evil", "exam",
  "face", "fact", "fade", "fail", "fair", "fake", "fall", "fame", "fang", "fare", "farm", "fast", "fate",
  "fawn", "fear", "feat", "feed", "feel", "feet", "fell", "felt", "file", "fill", "film", "find", "fine",
  "fire", "firm", "fish", "fist", "five", "flag", "flat", "flaw", "fled", "flee", "flex", "flip", "flit",
  "flog", "flow", "foam", "foil", "fold", "folk", "fond", "font", "food", "fool", "foot", "ford", "fore",
  "fork", "form", "fort", "foul", "four", "free", "frog", "from", "fuel", "full", "fume", "fund", "fuse",
  "fuss", "fury", "gain", "gait", "gale", "game", "gang", "gape", "garb", "gash", "gasp", "gate", "gave",
  "gaze", "gear", "gene", "gift", "gild", "gilt", "glad", "glow", "glue", "glut", "gnaw", "go", "goad",
  "goal", "goat", "goes", "gold", "golf", "gone", "good", "gore", "gown", "grab", "gram", "gray", "grew",
  "grey", "grid", "grim", "grin", "grip", "grit", "grow", "gulf", "gust", "hack", "hail", "hair", "hale",
  "half", "hall", "halt", "hand", "hang", "hard", "hare", "harm", "harp", "hate", "haul", "have", "haze",
  "head", "heal", "heap", "hear", "heat", "heed", "heel", "heir", "held", "hell", "help", "herb", "herd",
  "here", "hero", "hide", "high", "hike", "hill", "hint", "hire", "hiss", "hold", "hole", "home", "hood",
  "hook", "hope", "horn", "hose", "host", "hour", "howl", "huge", "hull", "hung", "hunt", "hurl", "hurt",
  "hush", "hymn", "icon", "idea", "inch", "into", "iron", "isle", "item", "jack", "jade", "jail", "jazz",
  "jeep", "jerk", "jest", "jobs", "join", "joke", "jolt", "jump", "jury", "just", "keen", "keep", "kept",
  "kick", "kill", "kind", "king", "kiss", "kite", "knee", "knew", "knit", "knob", "knot", "know", "lace",
  "lack", "laid", "lake", "lame", "lamp", "land", "lane", "lard", "lark", "lash", "lass", "last", "late",
  "lawn", "lead", "leaf", "leak", "lean", "leap", "left", "lend", "lens", "less", "lick", "life", "lift",
  "like", "limb", "lime", "limp", "line", "link", "lint", "lion", "list", "live", "load", "loaf", "loan",
  "lock", "loft", "logo", "lone", "long", "look", "loop", "lord", "lore", "lose", "loss", "lost", "loud",
  "love", "luck", "lump", "lung", "lure", "lurk", "lush", "lust", "made", "maid", "mail", "main", "make",
  "male", "mall", "malt", "mane", "many", "mare", "mark", "mash", "mask", "mass", "mast", "mate", "maze",
  "meal", "mean", "meat", "meet", "meld", "melt", "memo", "mend", "menu", "mere", "mesh", "mess", "mild",
  "mile", "milk", "mill", "mime", "mind", "mine", "mint", "miss", "mist", "moan", "moat", "mock", "mode",
  "mold", "mole", "mood", "moon", "moor", "more", "moss", "most", "moth", "move", "much", "mule", "muse",
  "must", "mute", "myth", "nail", "name", "nape", "nave", "navy", "near", "neat", "neck", "need", "nest",
  "news", "next", "nice", "nine", "node", "none", "noon", "norm", "nose", "note", "noun", "nude",
  "oath", "obey", "odds", "odor", "okay", "omen", "omit", "once", "only", "onto", "open", "oral", "orca",
  "oven", "over", "pace", "pack", "pact", "page", "paid", "pail", "pain", "pair", "pale", "palm", "pane",
  "park", "part", "pass", "past", "path", "pave", "pawn", "peak", "peal", "pear", "peat", "peck", "peel",
  "peer", "pest", "pick", "pier", "pike", "pile", "pine", "pink", "pipe", "pity", "plan", "play", "plea",
  "plod", "plot", "plow", "plug", "plum", "plus", "poke", "pole", "poll", "polo", "pond", "pool", "poor",
  "pope", "pore", "pork", "port", "pose", "post", "pour", "pray", "prey", "prod", "prop", "prow", "pull",
  "pulp", "pump", "punk", "pure", "push", "quit", "race", "rack", "raft", "rage", "raid", "rail", "rain",
  "rake", "ramp", "rang", "rank", "rant", "rare", "rash", "rasp", "rate", "rave", "read", "real", "reap",
  "rear", "reed", "reef", "reel", "rein", "rely", "rend", "rent", "rest", "rice", "rich", "ride", "rift",
  "rile", "rill", "rind", "ring", "riot", "ripe", "rise", "risk", "road", "roam", "roar", "robe", "rock",
  "rode", "role", "roll", "roof", "room", "root", "rope", "rose", "rote", "rout", "rude", "ruin", "rule",
  "rung", "rush", "rust", "sack", "safe", "sage", "said", "sail", "sake", "sale", "salt", "same", "sand",
  "sane", "sang", "sank", "sash", "save", "scan", "scar", "seal", "seam", "sear", "seat", "sect", "seed",
  "seek", "seem", "seen", "self", "sell", "send", "sent", "shed", "shin", "ship", "shop", "shot", "show",
  "shut", "sick", "side", "sift", "sigh", "sign", "silk", "sill", "silt", "sing", "sink", "sire", "site",
  "size", "skim", "skin", "skip", "skit", "slab", "slag", "slam", "slap", "slat", "slay", "sled", "slew",
  "slid", "slim", "slit", "slob", "slop", "slot", "slow", "slug", "slum", "slur", "smog", "snap", "snag",
  "snip", "snob", "snow", "snub", "snug", "soak", "soap", "soar", "sock", "sofa", "soft", "soil", "sold",
  "sole", "some", "song", "soon", "soot", "sore", "sort", "soul", "sour", "sown", "span", "spar", "spec",
  "sped", "spin", "spit", "spot", "spur", "stab", "stag", "star", "stay", "stem", "step", "stew", "stir",
  "stop", "stub", "stud", "stun", "such", "suit", "sulk", "sung", "sunk", "sure", "surf", "swan", "swap",
  "sway", "swim", "swum", "tabs", "tack", "tact", "tail", "take", "tale", "talk", "tall", "tame", "tang",
  "tank", "tape", "tart", "task", "taxi", "team", "tear", "teem", "tell", "temp", "tend", "tent", "term",
  "test", "text", "than", "that", "them", "then", "they", "thin", "this", "thus", "tick", "tide", "tidy",
  "tier", "tile", "till", "tilt", "time", "tiny", "tire", "toad", "toil", "told", "toll", "tomb", "tone",
  "took", "tool", "tops", "tore", "torn", "toss", "tour", "town", "trap", "tray", "tree", "trek", "trim",
  "trio", "trip", "trod", "trot", "true", "tube", "tuck", "tune", "turf", "turn", "tusk", "twin", "type",
  "ugly", "undo", "unit", "unto", "upon", "urge", "used", "user", "vain", "vale", "vane", "vary", "vase",
  "vast", "veil", "vein", "vent", "verb", "very", "vest", "veto", "vice", "view", "vine", "void", "volt",
  "vote", "wade", "wage", "wail", "wait", "wake", "walk", "wall", "wand", "want", "ward", "warm", "warn",
  "warp", "wart", "wary", "wash", "wasp", "wave", "wavy", "waxy", "weak", "wean", "wear", "weed", "week",
  "weld", "well", "went", "were", "west", "what", "when", "whim", "whip", "whom", "wick", "wide", "wife",
  "wild", "will", "wilt", "wily", "wind", "wine", "wing", "wipe", "wire", "wise", "wish", "wisp", "with",
  "woke", "wolf", "wood", "wool", "word", "wore", "work", "worm", "worn", "wove", "wrap", "wren", "yard",
  "yarn", "year", "yell", "yoga", "yoke", "zero", "zeal", "zone", "zoom",
  // 5-letter words
  "about", "above", "abuse", "actor", "adapt", "admit", "adopt", "adult", "after", "again", "agent", "agree",
  "ahead", "alarm", "album", "alert", "alien", "align", "alike", "alive", "alley", "allow", "alone", "along",
  "alter", "amaze", "ample", "angel", "anger", "angle", "angry", "ankle", "annex", "apart", "apple", "apply",
  "arena", "argue", "arise", "armor", "array", "arrow", "ash", "aside", "asset", "atlas", "attic", "audio",
  "audit", "avail", "avoid", "awake", "award", "aware", "badly", "badge", "baker", "bases", "basic", "basin",
  "batch", "beach", "beard", "beast", "began", "begin", "being", "below", "bench", "birth", "black", "blade",
  "blame", "bland", "blank", "blast", "blaze", "bleak", "bleed", "blend", "bless", "blind", "bliss", "block",
  "blood", "bloom", "blown", "blues", "blunt", "blurt", "board", "boast", "bonus", "boost", "booth", "bound",
  "brace", "brain", "brand", "brass", "brave", "bread", "break", "breed", "brick", "bride", "brief", "bring",
  "broad", "broke", "brook", "brown", "brush", "buddy", "build", "built", "bunch", "burst", "buyer", "cabin",
  "cable", "cache", "camel", "candy", "cargo", "carry", "carve", "catch", "cater", "cause", "cedar", "chain",
  "chair", "chalk", "champ", "charm", "chart", "chase", "cheap", "cheat", "check", "cheer", "chess", "chest",
  "chief", "child", "chill", "china", "chord", "chose", "chunk", "churn", "cider", "cigar", "civil", "claim",
  "clamp", "clash", "clasp", "class", "clean", "clear", "clerk", "click", "cliff", "climb", "cling", "clock",
  "clone", "close", "cloth", "cloud", "clown", "coach", "coast", "colon", "color", "comet", "coral", "couch",
  "could", "count", "court", "cover", "crack", "craft", "crane", "crash", "crawl", "craze", "crazy", "cream",
  "creek", "creep", "crest", "crime", "crisp", "cross", "crowd", "crown", "crude", "cruel", "crush", "curve",
  "cycle", "daily", "dairy", "dance", "death", "decay", "decor", "decoy", "delay", "delta", "dense", "depot",
  "depth", "derby", "devil", "diary", "dirty", "doing", "donor", "doubt", "dough", "dozen", "draft", "drain",
  "drake", "drama", "drank", "drape", "drawn", "dread", "dream", "dress", "dried", "drift", "drill", "drink",
  "drive", "droit", "drone", "drove", "drown", "dying", "eager", "eagle", "early", "earth", "eight", "elder",
  "elect", "elite", "embed", "ember", "empty", "enemy", "enjoy", "enter", "equal", "equip", "erode", "error",
  "erupt", "essay", "ethic", "event", "every", "evict", "exact", "exert", "exile", "exist", "extra", "fable",
  "facet", "faint", "fairy", "faith", "false", "fancy", "fatal", "fault", "favor", "feast", "fence", "ferry",
  "fetch", "fever", "fiber", "field", "fiend", "fifth", "fifty", "fight", "final", "first", "fixed", "flame",
  "flank", "flare", "flash", "flask", "fleet", "flesh", "flint", "float", "flock", "flood", "floor", "flora",
  "flour", "fluid", "fluke", "flung", "flush", "flute", "focal", "foggy", "force", "forge", "forth", "forum",
  "forty", "found", "frame", "frank", "fraud", "fresh", "front", "frost", "froze", "fruit", "fully", "fungi",
  "funny", "gauge", "genre", "ghost", "giant", "given", "gland", "glare", "glass", "gleam", "glide", "globe",
  "gloom", "glory", "gloss", "glove", "grace", "grade", "grain", "grand", "grant", "grape", "graph", "grasp",
  "grass", "grate", "grave", "gravel", "graze", "great", "greed", "green", "greet", "grief", "grind", "groan",
  "grope", "gross", "group", "grove", "growl", "grown", "guard", "guess", "guest", "guide", "guild", "guilt",
  "guise", "gully", "habit", "hairy", "handy", "happy", "harsh", "haste", "hasty", "hatch", "haunt", "haven",
  "heart", "heavy", "hedge", "hence", "honey", "honor", "horde", "horse", "hotel", "hound", "house", "human",
  "humor", "hurry", "hyper", "ideal", "image", "imply", "inept", "index", "indie", "infer", "inner", "input",
  "inter", "intro", "irony", "issue", "ivory", "jewel", "joint", "joker", "joust", "judge", "juice", "juicy",
  "jumbo", "karma", "kayak", "kebab", "knife", "knock", "known", "label", "labor", "lance", "large", "laser",
  "latch", "later", "laugh", "layer", "learn", "lease", "least", "leave", "ledge", "legal", "lemon", "level",
  "lever", "light", "limit", "linen", "lingo", "lived", "liver", "llama", "lobby", "local", "lodge", "lofty",
  "logic", "loose", "lorry", "lotus", "loved", "lover", "lower", "loyal", "lucky", "lunar", "lunch", "lunge",
  "lying", "macro", "magic", "major", "manor", "maple", "march", "marsh", "mason", "match", "mayor", "meant",
  "medal", "media", "mercy", "merge", "merit", "merry", "metal", "meter", "midst", "might", "minor", "minus",
  "mirth", "miser", "mixed", "model", "money", "month", "moral", "moron", "motor", "mound", "mount", "mourn",
  "mouse", "mouth", "moved", "movie", "muddy", "music", "naive", "named", "nasty", "naval", "nerve", "never",
  "newly", "niche", "night", "ninth", "noble", "noise", "north", "notch", "noted", "novel", "nudge", "nurse",
  "nylon", "oasis", "occur", "ocean", "offer", "often", "olive", "onset", "opera", "orbit", "order", "organ",
  "other", "ought", "outer", "outdo", "owner", "oxide", "ozone", "paint", "panel", "panic", "paper", "party",
  "pasta", "paste", "patch", "pause", "peace", "peach", "pearl", "pedal", "penny", "perch", "peril", "phase",
  "phone", "photo", "piano", "piece", "pilot", "pinch", "pitch", "pixel", "pizza", "place", "plaid", "plain",
  "plane", "plank", "plant", "plate", "plaza", "plead", "pleat", "plied", "pluck", "plumb", "plume", "plump",
  "plunge", "point", "poise", "polar", "poser", "pound", "power", "prank", "prawn", "press", "price", "pride",
  "prime", "print", "prior", "prism", "prize", "probe", "prone", "proof", "prose", "proud", "prove", "proxy",
  "prude", "prune", "psalm", "pulse", "punch", "pupil", "purge", "purse", "qualm", "queen", "query", "quest",
  "queue", "quick", "quiet", "quilt", "quirk", "quite", "quota", "quote", "radar", "radio", "rainy", "raise",
  "rally", "ranch", "range", "rapid", "ratio", "reach", "react", "ready", "realm", "rebel", "recap", "refer",
  "reign", "relax", "relay", "renew", "repay", "reply", "resin", "rider", "ridge", "rifle", "right", "rigid",
  "rigor", "rinse", "ripen", "risen", "risky", "rival", "river", "roast", "robin", "robot", "rocky", "rogue",
  "roman", "roost", "rouge", "rough", "round", "route", "rover", "royal", "rugby", "ruler", "rumor", "rural",
  "sadly", "saint", "salad", "salon", "satin", "sauce", "sauna", "savor", "scale", "scare", "scarf", "scene",
  "scent", "scope", "score", "scout", "scram", "scrap", "screw", "seize", "sense", "serum", "serve", "setup",
  "seven", "sever", "shade", "shaft", "shake", "shall", "shame", "shape", "share", "shark", "sharp", "shave",
  "shawl", "shear", "sheer", "sheet", "shelf", "shell", "shift", "shine", "shire", "shirt", "shock", "shoot",
  "shore", "short", "shout", "shove", "shown", "shrug", "siege", "sight", "sigma", "silly", "since", "sixth",
  "sixty", "sized", "skate", "skill", "skirt", "skull", "slate", "slave", "sleep", "slept", "slice", "slide",
  "slope", "sloth", "small", "smart", "smash", "smell", "smile", "smith", "smoke", "snack", "snake", "snare",
  "sneak", "sniff", "solar", "solid", "solve", "sonic", "sorry", "sound", "south", "space", "spade", "spare",
  "spark", "spawn", "speak", "spear", "speed", "spell", "spend", "spent", "spice", "spill", "spine", "spite",
  "split", "spoke", "spoon", "sport", "spray", "squad", "squid", "stack", "staff", "stage", "stain", "stair",
  "stake", "stale", "stalk", "stall", "stamp", "stand", "stare", "stark", "start", "state", "stave", "stays",
  "steak", "steal", "steam", "steel", "steep", "steer", "stern", "stick", "stiff", "still", "sting", "stink",
  "stock", "stole", "stomp", "stone", "stood", "stool", "stoop", "store", "stork", "storm", "story", "stout",
  "stove", "strap", "straw", "stray", "strip", "stuck", "study", "stuff", "stump", "stung", "stunk", "stunt",
  "style", "sugar", "suite", "sunny", "super", "surge", "swamp", "swarm", "swear", "sweat", "sweep", "sweet",
  "swell", "swept", "swift", "swing", "swirl", "sword", "swore", "sworn", "swung", "table", "taken", "taste",
  "teach", "teeth", "tempo", "theft", "their", "theme", "there", "these", "thick", "thief", "thigh", "thing",
  "think", "third", "thorn", "those", "three", "threw", "throw", "thumb", "tiger", "tight", "timer", "tired",
  "title", "toast", "today", "token", "torch", "total", "touch", "tough", "tower", "toxic", "trace", "track",
  "trade", "trail", "train", "trait", "tramp", "trash", "trawl", "tread", "treat", "trend", "trial", "tribe",
  "trick", "tried", "troop", "truck", "truly", "trunk", "trust", "truth", "tulip", "tumor", "tuned", "twice",
  "twist", "tying", "ultra", "uncle", "under", "undue", "union", "unite", "unity", "until", "upper", "upset",
  "urban", "usage", "usher", "usual", "utter", "valid", "valor", "value", "valve", "vapor", "vault", "venue",
  "verse", "vigor", "villa", "vinyl", "viola", "viper", "viral", "virus", "visit", "visor", "vista", "vital",
  "vivid", "vocal", "vodka", "voice", "vouch", "vowed", "voter", "vowel", "vulgar", "wages", "waist", "waste",
  "watch", "water", "weary", "weave", "wedge", "weigh", "weird", "whale", "wheat", "wheel", "where", "which",
  "while", "whine", "whirl", "white", "whole", "whose", "widen", "wider", "width", "wield", "witch", "woman",
  "women", "world", "worry", "worse", "worst", "worth", "would", "wound", "wrath", "wreck", "wrist", "write",
  "wrong", "wrote", "yacht", "yield", "young", "yours", "youth",
  // 6-letter words
  "absorb", "accent", "accept", "access", "across", "action", "actual", "afford", "agenda", "almost",
  "amount", "anchor", "animal", "annual", "answer", "appeal", "appear", "archer", "around", "artist",
  "assert", "assign", "assist", "assume", "attach", "attack", "attend", "august", "author", "banner",
  "barely", "basket", "battle", "before", "behind", "belong", "beyond", "bitter", "blanch", "border",
  "bother", "bottom", "bounce", "branch", "breath", "bridge", "bright", "broken", "bronze", "broker",
  "budget", "burden", "bureau", "butter", "button", "camera", "cancel", "candle", "carbon", "career",
  "castle", "casual", "caught", "center", "centre", "chance", "change", "charge", "choice", "choose",
  "church", "circle", "client", "clinic", "closed", "closer", "closet", "clutch", "coffee", "column",
  "combat", "comedy", "common", "convey", "cookie", "corner", "costly", "cotton", "county", "couple",
  "course", "cousin", "covers", "create", "credit", "crisis", "custom", "damage", "danger", "dealer",
  "debate", "decade", "decide", "defeat", "defend", "define", "degree", "demand", "denial", "depend",
  "deploy", "deputy", "desert", "design", "desire", "detail", "detect", "device", "devote", "differ",
  "dinner", "direct", "divide", "domain", "donate", "double", "dozens", "dragon", "drawer", "driven",
  "driver", "during", "easily", "eating", "editor", "effect", "effort", "eighth", "either", "empire",
  "employ", "enable", "endure", "energy", "engage", "engine", "enough", "ensure", "entire", "entity",
  "equity", "escape", "estate", "evolve", "exceed", "except", "excite", "excuse", "expand", "expect",
  "expert", "export", "expose", "extend", "extent", "fabric", "facial", "factor", "fairly", "fallen",
  "family", "famous", "farmer", "father", "fathom", "fellow", "female", "figure", "filter", "finger",
  "fiscal", "flavor", "flight", "flower", "flying", "follow", "forced", "forest", "forget", "formal",
  "former", "foster", "fourth", "friend", "frozen", "fulfil", "future", "gained", "gallon", "gaming",
  "garage", "garden", "gather", "gender", "genius", "gentle", "gently", "giving", "global", "golden",
  "govern", "ground", "growth", "guilty", "guitar", "handle", "happen", "hardly", "heaven", "height",
  "hidden", "highly", "honest", "horror", "housed", "hunter", "ignore", "immune", "impact", "import",
  "impose", "income", "indeed", "indoor", "inform", "injure", "injury", "inland", "inmate", "insert",
  "inside", "insist", "intact", "intend", "intent", "invent", "invest", "island", "itself", "jungle",
  "junior", "justice", "kidney", "killer", "kindly", "knight", "ladder", "lately", "launch", "lawyer",
  "layout", "leader", "league", "leaves", "lender", "lesson", "letter", "likely", "linear", "linger",
  "liquid", "listen", "litter", "little", "lively", "locate", "locked", "lonely", "lovely", "lumber",
  "luxury", "mainly", "making", "manage", "manner", "manual", "marble", "margin", "marker", "market",
  "master", "matter", "medium", "member", "memory", "mental", "mentor", "merely", "method", "middle",
  "mighty", "miller", "minute", "mirror", "mobile", "modest", "moment", "monkey", "mortal", "mostly",
  "mother", "motion", "motive", "moving", "murder", "museum", "mutual", "narrow", "nation", "nature",
  "nearby", "nearly", "neatly", "nicely", "nobody", "normal", "notice", "notion", "number", "object",
  "obtain", "occupy", "offend", "office", "online", "oppose", "option", "orange", "orient", "origin",
  "output", "oxygen", "palace", "parent", "parish", "partly", "patent", "patrol", "patron", "patter",
  "people", "period", "permit", "person", "phrase", "pillar", "pillow", "planet", "player", "please",
  "pledge", "plenty", "plunge", "pocket", "poetry", "poison", "police", "policy", "prefer", "pretty",
  "prince", "prison", "profit", "prompt", "proper", "proven", "public", "pursue", "puzzle", "racial",
  "random", "rather", "rating", "reader", "really", "reason", "rebel", "recall", "recent", "record",
  "reduce", "reform", "refuge", "regard", "regime", "region", "reject", "relate", "relief", "remain",
  "remedy", "remind", "remote", "remove", "render", "rental", "repair", "repeat", "report", "rescue",
  "resign", "resist", "resort", "result", "retain", "retire", "return", "reveal", "review", "revolt",
  "reward", "rhythm", "ribbon", "riding", "rising", "ritual", "robust", "rocket", "roller", "roster",
  "rotate", "ruling", "runner", "sacred", "safely", "safety", "salary", "sample", "sanity", "saving",
  "scared", "scheme", "school", "screen", "script", "search", "season", "second", "secret", "sector",
  "secure", "select", "senior", "sensor", "serial", "series", "settle", "severe", "shadow", "shaped",
  "sheets", "shield", "should", "shower", "signal", "silent", "silver", "simple", "simply", "singer",
  "single", "sister", "slight", "smooth", "soccer", "social", "solely", "solemn", "solver", "sought",
  "source", "speech", "sphere", "spirit", "spread", "spring", "square", "stable", "stance", "status",
  "steady", "stolen", "strain", "strand", "stream", "street", "strict", "strike", "string", "stroke",
  "strong", "struck", "studio", "submit", "subtle", "sudden", "suffer", "summer", "summit", "supply",
  "surely", "survey", "symbol", "system", "tackle", "talent", "target", "temple", "tenant", "tender",
  "terror", "thanks", "threat", "thrive", "thrown", "timber", "tissue", "tongue", "toward", "tragic",
  "travel", "treaty", "tribal", "trophy", "tunnel", "twelve", "unfair", "unique", "united", "unless",
  "unlike", "unlock", "update", "useful", "valley", "varied", "vendor", "victim", "viewer", "virtue",
  "vision", "visual", "volume", "voting", "walker", "wander", "warmth", "weapon", "weekly", "weight",
  "wildly", "window", "winner", "winter", "wisdom", "within", "wonder", "worker", "worthy", "writer",
  // 7-letter words
  "abandon", "ability", "absence", "academy", "account", "achieve", "acquire", "address", "advance",
  "adverse", "adviser", "cabinet", "capable", "captain", "capture", "careful", "carrier", "catalog",
  "caution", "central", "certain", "chamber", "chapter", "charter", "chicken", "chronic", "circuit",
  "citizen", "classic", "climate", "cluster", "coastal", "collect", "college", "combine", "comfort",
  "command", "comment", "company", "compare", "compete", "complex", "compose", "compute", "concept",
  "concern", "conduct", "confirm", "connect", "consent", "consist", "contact", "contain", "content",
  "context", "control", "convert", "correct", "cottage", "council", "counter", "country", "coupled",
  "courage", "created", "creator", "cricket", "crucial", "crystal", "culture", "current", "curtain",
  "cushion", "custody", "customs", "damaged", "dealing", "declare", "decline", "default", "defence",
  "deficit", "deliver", "deposit", "descent", "despite", "destiny", "destroy", "develop", "devoted",
  "diamond", "digital", "discuss", "disease", "display", "distant", "diverse", "divided", "drawing",
  "edition", "educate", "elderly", "elegant", "element", "embrace", "emotion", "emperor", "enforce",
  "engaged", "enhance", "essence", "evening", "evident", "examine", "example", "excited", "execute",
  "exhibit", "expense", "explain", "exploit", "explore", "express", "extreme", "factory", "faculty",
  "failure", "fashion", "feature", "fiction", "fighter", "finally", "finance", "finding", "formula",
  "fortune", "forward", "founder", "freedom", "further", "gallery", "gateway", "general", "genetic",
  "genuine", "gesture", "glimpse", "gradual", "habitat", "halfway", "handful", "harbour", "harmony",
  "harvest", "heading", "healthy", "hearing", "herself", "highway", "himself", "history", "holiday",
  "horizon", "hostile", "housing", "however", "hunting", "husband", "illness", "imagine", "imaging",
  "immense", "implied", "imposed", "impress", "improve", "impulse", "include", "initial", "inquiry",
  "install", "instant", "instead", "intense", "intrest", "involve", "isolate", "journey", "justice",
  "kingdom", "kitchen", "landing", "lasting", "lateral", "leading", "learned", "leather", "lecture",
  "liberal", "liberty", "license", "limited", "linking", "literal", "lodging", "logical", "machine",
  "manager", "married", "massive", "mastery", "measure", "meeting", "mention", "message", "migrate",
  "million", "mineral", "minimal", "miracle", "mission", "mistake", "mixture", "monitor", "monster",
  "morning", "mounted", "mystery", "natural", "neither", "nervous", "network", "neutral", "notable",
  "nothing", "nucleus", "nursing", "obvious", "offense", "officer", "opening", "operate", "opinion",
  "optical", "organic", "outdoor", "outline", "outlook", "overall", "package", "painful", "parking",
  "partial", "partner", "passage", "passing", "passive", "patient", "patriot", "pattern", "payment",
  "peasant", "penalty", "pension", "percent", "perfect", "perhaps", "persist", "picture", "pioneer",
  "placing", "plastic", "pleased", "pointer", "politic", "popular", "portion", "poverty", "precise",
  "predict", "premium", "prepare", "present", "prevent", "primary", "printer", "privacy", "private",
  "problem", "proceed", "process", "produce", "product", "profile", "program", "project", "promise",
  "promote", "protect", "protein", "protest", "provide", "publish", "pursuit", "qualify", "quarter",
  "radical", "reading", "reality", "realize", "receipt", "receive", "recover", "reflect", "regular",
  "related", "release", "remains", "removal", "removed", "renewal", "replace", "request", "require",
  "reserve", "resolve", "respect", "respond", "restore", "revenue", "reverse", "routine", "royalty",
  "running", "sailing", "scatter", "scholar", "science", "scratch", "section", "segment", "serving",
  "session", "setting", "shelter", "sheriff", "similar", "sitting", "skilled", "smoking", "society",
  "soldier", "somehow", "speaker", "special", "sponsor", "squeeze", "Station", "storage", "strange",
  "stretch", "striker", "subject", "succeed", "success", "suggest", "summary", "support", "suppose",
  "supreme", "surface", "surgeon", "surplus", "survive", "suspect", "sustain", "teacher", "tension",
  "theatre", "therapy", "thought", "tobacco", "tonight", "totally", "tourism", "tourist", "trading",
  "trainer", "transit", "trapped", "trouble", "trustee", "turning", "uniform", "unknown", "unusual",
  "upgrade", "variety", "vehicle", "venture", "version", "veteran", "village", "violent", "virtual",
  "visible", "walking", "wanting", "warfare", "warning", "warrant", "washing", "wealthy", "weather",
  "webinar", "website", "wedding", "weekend", "welcome", "welfare", "western", "whisper", "whoever",
  "willing", "winning", "witness", "working", "worried", "worship", "writing", "written"
];

// Source words with many possible sub-words
const SOURCE_WORDS = [
  "ORCHESTRA", "DANGEROUS", "EDUCATION", "NIGHTMARE", "BEAUTIFUL", "CREATURES",
  "MOUNTAINS", "PLATFORMS", "CHOCOLATE", "LANDSCAPE", "STREAMING", "WONDERFUL",
  "INTRODUCE", "IMPORTANT", "ADVENTURE", "THOUSANDS", "SCATTERED", "DIFFERENT",
  "SOMETHING", "COMPUTING", "COUNTRIES", "GARDENING", "OPERATION", "TELEPHONE",
  "MARKETING", "PAINTINGS", "BREAKFAST", "RELATIONS", "CHEMISTRY", "PASSENGER"
];

function canFormWord(word: string, availableLetters: string): boolean {
  const letterCounts: Record<string, number> = {};
  for (const l of availableLetters.toLowerCase()) {
    letterCounts[l] = (letterCounts[l] || 0) + 1;
  }
  for (const l of word.toLowerCase()) {
    if (!letterCounts[l]) return false;
    letterCounts[l]--;
  }
  return true;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WordBuilder() {
  type Difficulty = "superEasy" | "easy" | "medium" | "hard" | "impossible";

  const difficultyConfig = {
    superEasy: { name: "Super Easy", time: 300, color: "from-green-500 to-green-600" },
    easy: { name: "Easy", time: 180, color: "from-teal-500 to-teal-600" },
    medium: { name: "Medium", time: 120, color: "from-cyan-500 to-cyan-600" },
    hard: { name: "Hard", time: 60, color: "from-orange-500 to-orange-600" },
    impossible: { name: "Impossible", time: 30, color: "from-red-500 to-red-600" },
  };

  const [sourceWord, setSourceWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-word-builder");
    if (saved) setPersonalBest(parseInt(saved, 10));
    const savedDifficulty = localStorage.getItem("wb-difficulty");
    if (savedDifficulty && savedDifficulty in difficultyConfig) {
      setDifficulty(savedDifficulty as Difficulty);
    }
  }, []);

  const calculateScore = useCallback((words: string[]) => {
    return words.reduce((sum, word) => {
      return sum + Math.max(1, word.length - 2);
    }, 0);
  }, []);

  const startGame = useCallback(() => {
    const word = SOURCE_WORDS[Math.floor(Math.random() * SOURCE_WORDS.length)];
    setSourceWord(word);
    setScrambledLetters(shuffleArray(word.split("")));

    const possible = DICTIONARY.filter(
      (w) => w.length >= 3 && canFormWord(w, word)
    );
    setPossibleWords(possible);
    setFoundWords([]);
    setCurrentInput("");
    setTimeLeft(difficultyConfig[difficulty].time);
    setIsPlaying(true);
    setGameOver(false);
    setFeedback(null);
    inputRef.current?.focus();
  }, [difficulty]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          const score = calculateScore(foundWords);
          if (score > personalBest) {
            setPersonalBest(score);
            localStorage.setItem("pb-word-builder", score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, foundWords, calculateScore, personalBest]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const word = currentInput.trim().toLowerCase();

    if (!word) return;

    if (foundWords.map(w => w.toLowerCase()).includes(word)) {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
      return;
    }

    if (possibleWords.map(w => w.toLowerCase()).includes(word)) {
      setFoundWords([...foundWords, word]);
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
    }
  };

  const handleShare = () => {
    const score = calculateScore(foundWords);
    const text = `Word Builder 🔤\nFound: ${foundWords.length}/${possibleWords.length} words\nScore: ${score}\n\nPlay at playmini.fun/word-builder`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    localStorage.setItem("wb-difficulty", diff);
  };

  const missedWords = possibleWords.filter((w) => !foundWords.map(f => f.toLowerCase()).includes(w.toLowerCase()));
  const currentScore = calculateScore(foundWords);
  const isNewBest = gameOver && currentScore > personalBest;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        {!isPlaying && !gameOver && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Word Builder</h2>
            <p className="text-gray-300 mb-6">
              Create words from the letters of one word. Find as many as you can!
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Select Difficulty</h3>
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultySelect(diff)}
                    className={`px-6 py-4 bg-gradient-to-r ${difficultyConfig[diff].color} text-white font-bold rounded-xl hover:opacity-90 transition-all ${
                      difficulty === diff ? "ring-4 ring-white/30 scale-105" : ""
                    }`}
                  >
                    <div className="text-xl">{difficultyConfig[diff].name}</div>
                    <div className="text-sm opacity-90">
                      {Math.floor(difficultyConfig[diff].time / 60)}:{String(difficultyConfig[diff].time % 60).padStart(2, "0")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className={`px-8 py-3 bg-gradient-to-r ${difficultyConfig[difficulty].color} text-white font-bold rounded-xl hover:opacity-90 transition-opacity`}
            >
              Start Game
            </button>
            {personalBest > 0 && (
              <p className="text-gray-500 text-sm mt-4">Personal Best: {personalBest} points</p>
            )}
          </div>
        )}

        {isPlaying && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold text-cyan-400">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Score: {currentScore}</div>
                <div className="text-sm text-gray-400">
                  Found: {foundWords.length} / {possibleWords.length}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {scrambledLetters.map((letter, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500">Source: {sourceWord}</p>
            </div>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className={`flex-1 px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                    feedback === "correct"
                      ? "border-green-500 ring-green-500"
                      : feedback === "wrong"
                      ? "border-red-500 ring-red-500 animate-shake"
                      : "border-gray-700 focus:ring-cyan-500"
                  }`}
                  placeholder="Type a word..."
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </form>

            {foundWords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Found Words:</h3>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {foundWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm"
                    >
                      {word} <span className="text-green-500">+{Math.max(1, word.length - 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {gameOver && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
            {isNewBest && (
              <p className="text-xl text-yellow-400 mb-4">🎉 New Personal Best!</p>
            )}
            <div className="mb-6">
              <p className={`text-lg font-semibold mb-2 bg-gradient-to-r ${difficultyConfig[difficulty].color} bg-clip-text text-transparent`}>
                {difficultyConfig[difficulty].name}
              </p>
              <p className="text-2xl text-cyan-400 font-bold mb-1">Score: {currentScore}</p>
              <p className="text-gray-400">
                Found {foundWords.length} of {possibleWords.length} words
              </p>
              {personalBest > 0 && !isNewBest && (
                <p className="text-gray-500 text-sm mt-1">Personal Best: {personalBest}</p>
              )}
            </div>

            {foundWords.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Your Words:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {foundWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missedWords.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Missed Words ({missedWords.length}):
                </h3>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                  {missedWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setGameOver(false);
                  setIsPlaying(false);
                }}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Change Difficulty
              </button>
              <button
                onClick={startGame}
                className={`px-6 py-3 bg-gradient-to-r ${difficultyConfig[difficulty].color} text-white font-bold rounded-xl hover:opacity-90 transition-opacity`}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
