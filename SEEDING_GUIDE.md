# Database Seeding Guide

Quick reference for populating your microblog database with realistic test data.

## TL;DR

```bash
cd microblog-python
python scripts/seed_database.py
python scripts/demo_ranking.py techguru
```

## What You Get

- **10 Users**: Diverse personas (developers, designers, product managers, etc.)
- **50+ Posts**: Realistic content with emojis, UTF-8, varying lengths
- **Following Graph**: Social connections (influencers, mutual follows)
- **Timestamps**: Distributed from 5 minutes ago to 7 days ago
- **Login Ready**: All users have password `password123`

## Files Created

### Core Scripts

| File | Purpose |
|------|---------|
| `scripts/seed_database.py` | Main seeding utility (creates users, posts, follows) |
| `scripts/demo_ranking.py` | Demo the ranking algorithm with seeded data |
| `scripts/seed.sh` | Convenience wrapper for Docker |
| `scripts/README.md` | Complete documentation |

### Supporting Code

| File | Purpose |
|------|---------|
| `app/services/ranking.py` | 'For You' feed ranking algorithm |

## Usage

### Seed the Database

```bash
# Option 1: Direct execution
cd microblog-python
python scripts/seed_database.py

# Option 2: Docker wrapper
./scripts/seed.sh

# Option 3: Clean slate
python scripts/seed_database.py --cleanup  # Deletes all data first
```

### Demo the Algorithm

```bash
# View ranked feed for any seeded user
python scripts/demo_ranking.py techguru
python scripts/demo_ranking.py designwiz
python scripts/demo_ranking.py startup_founder
```

Output shows:
- User profile and following count
- Top 10 posts with urgency scores
- Score breakdown (recency, social, quality)
- Algorithm explanation
- Suggestions for experimentation

### Login as Seeded User

1. Start the app: `docker-compose up -d`
2. Navigate to http://localhost:3000
3. Login with any username (e.g., `techguru`)
4. Password: `password123`
5. Explore the personalized feed!

## Seeded Users

All 10 users use password: `password123`

| Username | Display Name | Role |
|----------|-------------|------|
| `techguru` | Tech Guru | Software Engineer (Influencer) |
| `designwiz` | Design Wizard | UX/UI Designer |
| `datascience_pro` | Data Science Pro | ML Engineer (Active Follower) |
| `startup_founder` | Sarah Chen | Entrepreneur (Influencer) |
| `devops_ninja` | DevOps Ninja | Infrastructure Engineer |
| `product_pm` | Alex Rivera | Product Manager (Active Follower) |
| `frontend_dev` | Emma Watson | Frontend Developer (Active Follower) |
| `backend_expert` | Backend Expert | Backend Developer |
| `security_specialist` | Security Specialist | Cybersecurity Expert |
| `indie_hacker` | Indie Hacker | SaaS Builder (Influencer) |

## Post Distribution

The seeding creates varied content to test all aspects of your feed:

### By Timestamp
- 30% very recent (0-30 minutes)
- 25% recent (30 min - 4 hours)
- 20% today (4-24 hours)
- 15% yesterday (1-2 days)
- 10% old (2-7 days)

### By Content Type
- Short thoughts (10-50 chars)
- Announcements with emojis
- Questions
- Code releases
- Long-form content (up to 280 chars)
- UTF-8 variety (日本語, Ñoño)
- Hashtags and mentions

### By Author
- Influencers (users 0, 3, 9) post 3x more frequently
- Ensures diverse content in every feed

## The Ranking Algorithm

The demo showcases a simple but effective ranking algorithm:

```python
urgency_score = (recency × 0.5) + (social × 0.3) + (quality × 0.2)
```

### Recency Score (0-1)
- Last hour: 1.0
- Last day: 0.7-1.0
- Last week: 0.3-0.7
- Older: <0.3 (exponential decay)

### Social Score (0-1)
- Mutual follow: 1.0
- You follow them: 0.8
- No relationship: 0.2

### Quality Score (0-1)
- Ideal length (100-200 chars): 1.0
- Short posts (<50): penalized
- Long posts (>200): bonus
- Has emojis: +0.1

## Idempotency

The script is safe to run multiple times:
- Users are checked by username (won't duplicate)
- Following relationships are preserved
- Post count is checked before creating more

## Cleanup

⚠️ **WARNING**: This deletes ALL data!

```bash
python scripts/seed_database.py --cleanup
```

## Customization

Edit `SeedConfig` in `seed_database.py`:

```python
class SeedConfig:
    NUM_USERS = 10        # How many users to create
    NUM_POSTS = 50        # How many posts to create
    DEFAULT_PASSWORD = "password123"
    MIN_POST_LENGTH = 10
    MAX_POST_LENGTH = 280
```

## Troubleshooting

### Faker Not Found

```bash
# Install Faker
pip install faker

# Or rebuild container
docker-compose build microblog-python
```

### Database Not Running

```bash
docker-compose up -d postgres
```

### Permission Denied

```bash
chmod +x scripts/seed_database.py
chmod +x scripts/demo_ranking.py
chmod +x scripts/seed.sh
```

## Integration with Testing

The seeded data is perfect for:
- Manual QA of the feed algorithm
- Integration tests for ranking logic
- UI testing with varied content
- Performance testing with realistic data volume
- UTF-8 encoding verification

## Next Steps

1. **Seed the database** (2 minutes)
2. **Run the demo** to understand the algorithm (1 minute)
3. **Login and explore** the personalized feed (5 minutes)
4. **Modify ranking weights** and re-run the demo (10 minutes)
5. **Build new ranking features** with rich test data

## Architecture Context

This seeding utility fits into the "LIFO" architecture:

```
CLIENT (React)        → Login as seeded user
   ↓
BFF (Next.js)         → Fetches from FastAPI
   ↓
BRAIN (FastAPI)       → Runs ranking.py algorithm ← You are here
   ↓
MEMORY (PostgreSQL)   → Uses seed_database.py data
```

## Full Documentation

See [microblog-python/scripts/README.md](microblog-python/scripts/README.md) for:
- Complete implementation details
- Password hashing explanation
- Faker library usage
- Contributing guidelines
