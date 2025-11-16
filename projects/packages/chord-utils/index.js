// Pure chord utilities (no browser APIs)

function normalizeChordInput(input) {
  if (!input || typeof input !== 'string') return '';

  // Clean and normalize the input
  let normalized = input.trim().toLowerCase();

  // Remove extra spaces and normalize spacing
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Join accidental separated by space with root (e.g., 'c #' => 'c#', 'd b' => 'db')
  normalized = normalized.replace(/([a-g])\s*([#b])/g, '$1$2');

  // Extract root note (handle sharps/flats and case insensitivity)
  const rootMatch = normalized.match(/^([a-g][#b]?)/);
  if (!rootMatch) return '';

  let root = rootMatch[1].toUpperCase();
  let remainder = normalized.slice(rootMatch[0].length).trim();

  // Collapse spaces in remainder so 'm 7' -> 'm7', 'maj 7' -> 'maj7'
  remainder = remainder.replace(/\s+/g, '');

  // Enharmonic equivalents to sharps
  const enharmonicMap = {
    db: 'C#', 'c#': 'C#',
    eb: 'D#', 'd#': 'D#',
    gb: 'F#', 'f#': 'F#',
    ab: 'G#', 'g#': 'G#',
    bb: 'A#', 'a#': 'A#'
  };
  if (enharmonicMap[root.toLowerCase()]) {
    root = enharmonicMap[root.toLowerCase()];
  }

  // Chord type mappings (single source of truth)
  const chordTypeMappings = {
    '': '',
    major: '',
    maj: '',
    majr: '',
    najor: '',
    maojr: '',
    minor: 'm',
    min: 'm',
    mino: 'm',
    mjnor: 'm',
    minpr: 'm',
    m: 'm',
    augmented: 'aug',
    aug: 'aug',
    '°': 'aug',
    '+': 'aug',
    diminished: 'dim',
    dim: 'dim',
    o: 'dim',
    '7': '7',
    '7th': '7',
    seventh: '7',
    'dom 7': '7',
    'dominant 7': '7',
    'dominant 7th': '7',
    'dominant seventh': '7',
    maj7: 'maj7',
    'major 7': 'maj7',
    'major 7th': 'maj7',
    'major seventh': 'maj7',
    'minor 7': 'm7',
    'minor 7th': 'm7',
    'minor seventh': 'm7',
    m7: 'm7',
    '9': 'add9',
    add9: 'add9',
    'add 9': 'add9'
  };

  // Special cases
  if (remainder.match(/^m7$/i) && /[A-Z]/.test(input)) remainder = 'maj7';
  if (remainder.match(/^mm7$/i)) remainder = '7';

  let chordType = '';
  if (Object.prototype.hasOwnProperty.call(chordTypeMappings, remainder)) {
    chordType = chordTypeMappings[remainder];
  } else {
    const key = Object.keys(chordTypeMappings).find(k => k.toLowerCase() === remainder.toLowerCase());
    chordType = key ? chordTypeMappings[key] : '';
  }

  return root + chordType;
}

function extractRootNote(input) {
  const match = (input || '').match(/^([A-G][#b]?)/i);
  if (!match) return null;
  let root = match[1].toUpperCase();
  const enharmonicMap = {
    DB: 'C#', 'C#': 'C#',
    EB: 'D#', 'D#': 'D#',
    GB: 'F#', 'F#': 'F#',
    AB: 'G#', 'G#': 'G#',
    BB: 'A#', 'A#': 'A#'
  };
  if (enharmonicMap[root]) root = enharmonicMap[root];
  return root;
}

function generateChordVariations(rootNote) {
  const chordTypes = [
    '', 'm', '7', 'maj7', 'm7', 'sus4', 'sus2', 'dim', 'aug',
    '6', 'm6', '9', 'maj9', 'm9', 'add9', '11', '13', '7sus4', 'dim7', 'aug7'
  ];
  return chordTypes.map(type => rootNote + type);
}

function filterAndPrioritizeVariations(variations, input, maxSuggestions = 5) {
  const inputLower = (input || '').toLowerCase();
  const scored = variations.map(variation => {
    const v = variation.toLowerCase();
    let score = 0;
    if (v === inputLower) score = 100;
    else if (v.startsWith(inputLower)) score = 80;
    else if (v.includes(inputLower)) score = 60;
    else score = 40;
    return { chord: variation, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, maxSuggestions).map(s => s.chord);
}

function getSuggestions(input, maxSuggestions = 5) {
  if (!input || input.length < 1) return [];
  const root = extractRootNote(input);
  if (!root) return [];
  const variations = generateChordVariations(root);
  return filterAndPrioritizeVariations(variations, input, maxSuggestions);
}

function parseChord(input) {
  const n = normalizeChordInput(input);
  return n || null;
}

export {
  normalizeChordInput,
  extractRootNote,
  generateChordVariations,
  filterAndPrioritizeVariations,
  getSuggestions,
  parseChord
};
