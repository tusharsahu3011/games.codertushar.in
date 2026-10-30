export interface WordPairItem {
  category: string;
  wordA: string;
  wordB: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'All Categories', icon: 'Sparkles', desc: 'A rich mix of everything' },
  { id: 'food', label: 'Food & Drinks', icon: 'Utensils', desc: 'Delicious eats, snacks & beverages' },
  { id: 'tech_pop', label: 'Pop Culture & Tech', icon: 'Gamepad2', desc: 'Movies, apps, heroes & gadgets' },
  { id: 'places', label: 'Places & Travel', icon: 'Compass', desc: 'Destinations, cities & landmarks' },
  { id: 'college', label: 'College & Social Life', icon: 'GraduationCap', desc: 'Campus vibes, exams & hangouts' },
  { id: 'objects', label: 'Everyday Objects', icon: 'Package', desc: 'Things you see and use every day' },
  { id: 'nature', label: 'Animals & Nature', icon: 'TreePine', desc: 'Wildlife, pets & natural wonders' },
];

export const WORD_PAIRS: WordPairItem[] = [
  // Food & Drinks
  { category: 'food', wordA: 'Coffee', wordB: 'Tea' },
  { category: 'food', wordA: 'Pizza', wordB: 'Burger' },
  { category: 'food', wordA: 'Pancake', wordB: 'Waffle' },
  { category: 'food', wordA: 'Sushi', wordB: 'Sashimi' },
  { category: 'food', wordA: 'Apple', wordB: 'Pear' },
  { category: 'food', wordA: 'Coca-Cola', wordB: 'Pepsi' },
  { category: 'food', wordA: 'Chocolate', wordB: 'Vanilla' },
  { category: 'food', wordA: 'Cake', wordB: 'Brownie' },
  { category: 'food', wordA: 'Butter', wordB: 'Margarine' },
  { category: 'food', wordA: 'Taco', wordB: 'Burrito' },
  { category: 'food', wordA: 'Orange', wordB: 'Tangerine' },
  { category: 'food', wordA: 'Ice Cream', wordB: 'Frozen Yogurt' },
  { category: 'food', wordA: 'Sandwich', wordB: 'Toast' },
  { category: 'food', wordA: 'Spaghetti', wordB: 'Noodles' },
  { category: 'food', wordA: 'Potato Chips', wordB: 'Popcorn' },
  { category: 'food', wordA: 'Croissant', wordB: 'Bagel' },
  { category: 'food', wordA: 'Jam', wordB: 'Honey' },
  { category: 'food', wordA: 'Cookie', wordB: 'Biscuit' },
  { category: 'food', wordA: 'Donut', wordB: 'Churro' },
  { category: 'food', wordA: 'Smoothie', wordB: 'Milkshake' },
  { category: 'food', wordA: 'Lemonade', wordB: 'Iced Tea' },
  { category: 'food', wordA: 'Soup', wordB: 'Stew' },
  { category: 'food', wordA: 'Ketchup', wordB: 'Mayonnaise' },

  // Tech & Pop Culture
  { category: 'tech_pop', wordA: 'Netflix', wordB: 'YouTube' },
  { category: 'tech_pop', wordA: 'Instagram', wordB: 'TikTok' },
  { category: 'tech_pop', wordA: 'Marvel', wordB: 'DC' },
  { category: 'tech_pop', wordA: 'Batman', wordB: 'Spider-Man' },
  { category: 'tech_pop', wordA: 'PlayStation', wordB: 'Xbox' },
  { category: 'tech_pop', wordA: 'Harry Potter', wordB: 'Lord of the Rings' },
  { category: 'tech_pop', wordA: 'Spotify', wordB: 'Apple Music' },
  { category: 'tech_pop', wordA: 'Laptop', wordB: 'Tablet' },
  { category: 'tech_pop', wordA: 'Headphones', wordB: 'Earbuds' },
  { category: 'tech_pop', wordA: 'WhatsApp', wordB: 'Telegram' },
  { category: 'tech_pop', wordA: 'Minecraft', wordB: 'Roblox' },
  { category: 'tech_pop', wordA: 'Star Wars', wordB: 'Star Trek' },
  { category: 'tech_pop', wordA: 'iPhone', wordB: 'Android' },
  { category: 'tech_pop', wordA: 'Google', wordB: 'Wikipedia' },
  { category: 'tech_pop', wordA: 'Twitter', wordB: 'Reddit' },
  { category: 'tech_pop', wordA: 'Anime', wordB: 'Cartoon' },
  { category: 'tech_pop', wordA: 'Cinema', wordB: 'Television' },
  { category: 'tech_pop', wordA: 'Guitar', wordB: 'Violin' },
  { category: 'tech_pop', wordA: 'Piano', wordB: 'Keyboard' },
  { category: 'tech_pop', wordA: 'Fortnite', wordB: 'PUBG' },

  // Places & Travel
  { category: 'places', wordA: 'Beach', wordB: 'Swimming Pool' },
  { category: 'places', wordA: 'Hotel', wordB: 'Resort' },
  { category: 'places', wordA: 'Airport', wordB: 'Train Station' },
  { category: 'places', wordA: 'Forest', wordB: 'Jungle' },
  { category: 'places', wordA: 'Mountain', wordB: 'Hill' },
  { category: 'places', wordA: 'Paris', wordB: 'Rome' },
  { category: 'places', wordA: 'Museum', wordB: 'Art Gallery' },
  { category: 'places', wordA: 'Zoo', wordB: 'Safari' },
  { category: 'places', wordA: 'Island', wordB: 'Peninsula' },
  { category: 'places', wordA: 'Desert', wordB: 'Beach' },
  { category: 'places', wordA: 'River', wordB: 'Lake' },
  { category: 'places', wordA: 'Castle', wordB: 'Palace' },
  { category: 'places', wordA: 'Subway', wordB: 'Bus' },
  { category: 'places', wordA: 'Library', wordB: 'Bookstore' },
  { category: 'places', wordA: 'Gym', wordB: 'Stadium' },
  { category: 'places', wordA: 'Tent', wordB: 'Cabin' },
  { category: 'places', wordA: 'Amusement Park', wordB: 'Carnival' },
  { category: 'places', wordA: 'Bridge', wordB: 'Tunnel' },

  // College & Social Life
  { category: 'college', wordA: 'Canteen', wordB: 'Café' },
  { category: 'college', wordA: 'Assignment', wordB: 'Exam' },
  { category: 'college', wordA: 'Lecture', wordB: 'Seminar' },
  { category: 'college', wordA: 'Library', wordB: 'Hostel Room' },
  { category: 'college', wordA: 'All-nighter', wordB: 'Power Nap' },
  { category: 'college', wordA: 'Internship', wordB: 'Part-time Job' },
  { category: 'college', wordA: 'Professor', wordB: 'Teaching Assistant' },
  { category: 'college', wordA: 'Backpack', wordB: 'Tote Bag' },
  { category: 'college', wordA: 'Highlighter', wordB: 'Marker' },
  { category: 'college', wordA: 'Group Project', wordB: 'Solo Assignment' },
  { category: 'college', wordA: 'Presentation', wordB: 'Essay' },
  { category: 'college', wordA: 'Syllabus', wordB: 'Textbook' },
  { category: 'college', wordA: 'GPA', wordB: 'Attendance' },
  { category: 'college', wordA: 'Campus', wordB: 'City Center' },
  { category: 'college', wordA: 'Freshman', wordB: 'Senior' },
  { category: 'college', wordA: 'Bicycle', wordB: 'Scooter' },

  // Everyday Objects
  { category: 'objects', wordA: 'Pencil', wordB: 'Pen' },
  { category: 'objects', wordA: 'Backpack', wordB: 'Briefcase' },
  { category: 'objects', wordA: 'Sunglasses', wordB: 'Reading Glasses' },
  { category: 'objects', wordA: 'Umbrella', wordB: 'Raincoat' },
  { category: 'objects', wordA: 'Wristwatch', wordB: 'Smartwatch' },
  { category: 'objects', wordA: 'Mirror', wordB: 'Window' },
  { category: 'objects', wordA: 'Toothbrush', wordB: 'Hairbrush' },
  { category: 'objects', wordA: 'Pillow', wordB: 'Cushion' },
  { category: 'objects', wordA: 'Blanket', wordB: 'Duvet' },
  { category: 'objects', wordA: 'Candle', wordB: 'Flashlight' },
  { category: 'objects', wordA: 'Wallet', wordB: 'Coin Pouch' },
  { category: 'objects', wordA: 'Scissors', wordB: 'Cutter' },
  { category: 'objects', wordA: 'Coffee Mug', wordB: 'Tumbler' },
  { category: 'objects', wordA: 'Key', wordB: 'Passcode' },
  { category: 'objects', wordA: 'Soap', wordB: 'Shower Gel' },
  { category: 'objects', wordA: 'Towel', wordB: 'Bathrobe' },
  { category: 'objects', wordA: 'Curtain', wordB: 'Blinds' },
  { category: 'objects', wordA: 'Spoon', wordB: 'Fork' },

  // Animals & Nature
  { category: 'nature', wordA: 'Lion', wordB: 'Tiger' },
  { category: 'nature', wordA: 'Dolphin', wordB: 'Whale' },
  { category: 'nature', wordA: 'Butterfly', wordB: 'Moth' },
  { category: 'nature', wordA: 'Crocodile', wordB: 'Alligator' },
  { category: 'nature', wordA: 'Wolf', wordB: 'Fox' },
  { category: 'nature', wordA: 'Duck', wordB: 'Goose' },
  { category: 'nature', wordA: 'Rabbit', wordB: 'Hare' },
  { category: 'nature', wordA: 'Leopard', wordB: 'Cheetah' },
  { category: 'nature', wordA: 'Eagle', wordB: 'Falcon' },
  { category: 'nature', wordA: 'Frog', wordB: 'Toad' },
  { category: 'nature', wordA: 'Bee', wordB: 'Wasp' },
  { category: 'nature', wordA: 'Horse', wordB: 'Donkey' },
  { category: 'nature', wordA: 'Penguin', wordB: 'Puffin' },
  { category: 'nature', wordA: 'Octopus', wordB: 'Squid' },
  { category: 'nature', wordA: 'Owl', wordB: 'Bat' },
  { category: 'nature', wordA: 'Shark', wordB: 'Swordfish' }
];

export interface SelectedWords {
  civilianWord: string;
  undercoverWord: string;
  category: string;
  pair: string;
}

export function getRandomWordPair(category: string = 'all', usedIndices: number[] = []): SelectedWords {
  let pool = WORD_PAIRS;
  if (category && category !== 'all') {
    pool = WORD_PAIRS.filter(p => p.category === category);
    if (pool.length === 0) pool = WORD_PAIRS;
  }
  
  const available = pool.filter((_, idx) => !usedIndices.includes(idx));
  const selectionPool = available.length > 0 ? available : pool;
  
  const chosen = selectionPool[Math.floor(Math.random() * selectionPool.length)];
  
  const flip = Math.random() > 0.5;
  return {
    civilianWord: flip ? chosen.wordA : chosen.wordB,
    undercoverWord: flip ? chosen.wordB : chosen.wordA,
    category: chosen.category,
    pair: `${chosen.wordA} & ${chosen.wordB}`
  };
}
