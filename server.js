const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs'); // for SSL read
const path = require('path');
const https = require('https');

const app = express();
const PORT = 443; // HTTPS runs on port 443
const SCORES_FILE = path.join(__dirname, 'scores.json');

// SSL Configuration
const sslOptions = {
    key: fsSync.readFileSync(path.join(__dirname, 'selfsigned.key')),
    cert: fsSync.readFileSync(path.join(__dirname, 'selfsigned.crt')),
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files (index.html, etc.)

// Initialize scores file if it doesn't exist
async function initializeScoresFile() {
    try {
        await fs.access(SCORES_FILE);
    } catch (error) {
        await fs.writeFile(SCORES_FILE, JSON.stringify([]));
        console.log('✅ Created scores.json file');
    }
}

// Load scores
async function loadScores() {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error loading scores:', error);
        return [];
    }
}

// Save scores
async function saveScores(scores) {
    try {
        await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error saving scores:', error);
        return false;
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '2048 Game API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all scores
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await loadScores();
        res.json(scores);
    } catch {
        res.status(500).json({ error: 'Failed to load scores' });
    }
});

// Get top N scores
app.get('/api/scores/top/:limit?', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 10;
        const scores = await loadScores();
        const topScores = scores.sort((a, b) => b.score - a.score).slice(0, limit);
        res.json(topScores);
    } catch {
        res.status(500).json({ error: 'Failed to load top scores' });
    }
});

// Add a score
app.post('/api/scores', async (req, res) => {
    try {
        const { score, timestamp } = req.body;
        if (typeof score !== 'number' || score < 0 || !timestamp) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const scores = await loadScores();
        const newScore = {
            id: Date.now().toString(),
            score,
            timestamp,
            date: new Date(timestamp).toLocaleDateString()
        };
        scores.push(newScore);

        if (await saveScores(scores)) {
            res.status(201).json({ message: 'Score saved', score: newScore });
        } else {
            res.status(500).json({ error: 'Failed to save score' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const scores = await loadScores();
        if (scores.length === 0) {
            return res.json({ totalGames: 0, averageScore: 0, highestScore: 0, lowestScore: 0 });
        }

        const scoreValues = scores.map(s => s.score);
        const stats = {
            totalGames: scores.length,
            averageScore: Math.round(scoreValues.reduce((a, b) => a + b, 0) / scores.length),
            highestScore: Math.max(...scoreValues),
            lowestScore: Math.min(...scoreValues),
            recentGames: scores.slice(-5).reverse()
        };
        res.json(stats);
    } catch {
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// Delete one score
app.delete('/api/scores/:id', async (req, res) => {
    try {
        const scores = await loadScores();
        const updated = scores.filter(score => score.id !== req.params.id);

        if (updated.length === scores.length) {
            return res.status(404).json({ error: 'Score not found' });
        }

        if (await saveScores(updated)) {
            res.json({ message: 'Score deleted' });
        } else {
            res.status(500).json({ error: 'Delete failed' });
        }
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete all scores
app.delete('/api/scores', async (req, res) => {
    try {
        if (await saveScores([])) {
            res.json({ message: 'All scores cleared' });
        } else {
            res.status(500).json({ error: 'Clear failed' });
        }
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve game frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start HTTPS server
async function startServer() {
    try {
        await initializeScoresFile();
        https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
            console.log(`🔐 HTTPS server running at https://<your-ec2-ip>/`);
        });
    } catch (error) {
        console.error('❌ Failed to start HTTPS server:', error);
        process.exit(1);
    }
}

startServer();
