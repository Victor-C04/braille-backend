const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const dictionary = require('./dictionary.json');

app.use(cors());
app.use(express.json());

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

app.post('/suggest', (req, res) => {
  const input = req.body.input?.toLowerCase() || "";

  // Ignore if input too short
  if (input.length < 2) return res.json({ suggestions: [] });

  // Load words that start with the input
  const prefixMatches = dictionary.filter(word => word.startsWith(input));

  // Use prefix matches if available, otherwise fallback to Levenshtein
  const baseList = prefixMatches.length > 0 ? prefixMatches : dictionary;

  const sorted = baseList
    .map(word => ({ word, distance: levenshtein(input, word) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(entry => entry.word);

  console.log("INPUT:", input, "→ Suggestions:", sorted);
  res.json({ suggestions: sorted });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});