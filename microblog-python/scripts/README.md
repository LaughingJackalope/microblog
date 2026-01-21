# Microblog Seeding Scripts

## Overview

This directory contains database seeding utilities for the microblog application.

## Synthetic Intelligence Seeding (SIS)

The `seed_database.py` script populates your PostgreSQL database with realistic, interconnected test data to demonstrate the "For You Page" ranking algorithm.

### Features

- **10 Diverse Users**: Realistic profiles representing different personas (developers, designers, product managers, etc.)
- **Following Graph**: Interconnected social network with influencers and active followers
- **50+ Posts**: Varied content with different timestamps to test recency ranking
- **UTF-8 Content**: Posts include emojis, special characters, and varying lengths (10-280 chars)
- **Idempotent**: Safe to run multiple times without creating duplicates
- **Production-Ready Auth**: All seeded users use bcrypt-hashed passwords compatible with the app's authentication

### Quick Start

#### Inside Docker Container

```bash
# Enter the microblog-python container
docker exec -it microblog-python bash

# Run the seeding script
python scripts/seed_database.py
```

#### Local Development

```bash
# Ensure dependencies are installed
pip install -e .

# Run the seeding script
python scripts/seed_database.py
```

### What Gets Created

#### Users (10)

Each user has:
- Unique username and email
- Display name and bio
- Password: `password123` (all users)
- User IDs: `techguru`, `designwiz`, `datascience_pro`, `startup_founder`, etc.

Example:
```
Username: techguru
Email: techguru@microblog.dev
Display Name: Tech Guru
Bio: Senior Software Engineer 🚀 | Building the future with Python & TypeScript
Password: password123
```

#### Following Graph

The script creates a realistic social network:
- **Influencers** (users 0, 3, 9): Followed by most users, post more frequently
- **Active Followers** (users 2, 5, 6): Follow many users
- **Mutual Follows**: Random 30% chance for reciprocal relationships
- Average: ~3-5 follows per user

#### Posts (50+)

Posts are distributed across users with:
- **Content Variety**: Short thoughts, announcements, questions, technical posts, emojis
- **Length Variety**: 10-280 characters to test UI layout
- **Timestamp Distribution**:
  - 30% very recent (0-30 minutes ago)
  - 25% recent (30 min - 4 hours ago)
  - 20% today (4-24 hours ago)
  - 15% yesterday (1-2 days ago)
  - 10% old (2-7 days ago)
- **Weighted Authors**: Influencers post 3x more than regular users

### Advanced Usage

#### Cleanup Database

**WARNING**: This deletes ALL data!

```bash
python scripts/seed_database.py --cleanup
```

#### Customize Seeding Parameters

Edit the `SeedConfig` class in `seed_database.py`:

```python
class SeedConfig:
    NUM_USERS = 10        # Number of users to create
    NUM_POSTS = 50        # Number of posts to create
    DEFAULT_PASSWORD = "password123"
    MIN_POST_LENGTH = 10
    MAX_POST_LENGTH = 280
```

### Testing the For You Page Algorithm

After seeding, you can test the ranking algorithm:

1. **Log in as any user**:
   - Username: `techguru` (or any from the list)
   - Password: `password123`

2. **Test Different Feeds**:
   - **Following Feed**: Shows posts from users you follow (sorted by recency)
   - **Global Feed**: Shows all posts with ranking algorithm applied

3. **Expected Behavior**:
   - Recent posts should rank higher
   - Posts from followed users may get boosted
   - Timestamp distribution ensures variety in feed ordering

### Troubleshooting

#### Faker Import Error

If you see `ModuleNotFoundError: No module named 'faker'`:

```bash
# Inside container
pip install faker

# Or rebuild the container
docker-compose build microblog-python
```

#### Database Connection Error

Ensure PostgreSQL is running:

```bash
docker-compose up -d postgres
```

#### Duplicate Key Errors

The script is idempotent, but if you encounter issues:

```bash
# Clean and reseed
python scripts/seed_database.py --cleanup
python scripts/seed_database.py
```

### Output Example

```
🌱 Starting Synthetic Intelligence Seeding (SIS)
============================================================

🔐 Password for all seeded users: 'password123'

👥 Creating 10 users...
  + Created user 'techguru'
  + Created user 'designwiz'
  ...

📊 Creating following graph...
  + User 'techguru' now follows 2 users
  + User 'designwiz' now follows 3 users
  ...

📝 Creating 50 posts...
  + Created 10/50 posts
  + Created 20/50 posts
  ...

============================================================
✅ Seeding Complete!
============================================================

📊 Database Statistics:
  • Total Users: 10
  • Total Posts: 50
  • Total Follows: 35
  • Avg Follows per User: 3.5

⏰ Post Recency Distribution:
  • Last hour: 15
  • Last 24 hours: 38
  • Older: 12

💡 Next Steps:
  1. Log in as any user (e.g., 'techguru')
  2. Password: 'password123'
  3. Explore the 'For You' feed to see ranking algorithm in action
  4. Test Following vs Global feeds

============================================================
```

### Implementation Details

#### Idempotency

The script checks for existing data before creating:
- Users are checked by username
- Following relationships are preserved if they exist
- Post count is checked before creating new posts

#### Password Hashing

Uses the same `passlib` + `bcrypt` hashing as the main app:

```python
from app.security import get_password_hash
password_hash = get_password_hash("password123")
```

This ensures seeded users can actually log in through the frontend.

#### Realistic Data Generation

Uses the `Faker` library with seeded randomness for reproducibility:

```python
from faker import Faker
fake = Faker()
Faker.seed(42)  # Same data every time
```

Content includes:
- Emojis: 🚀 🎨 💡 🔐
- Unicode: 日本語, Ñoño
- Hashtags: #coding #tech
- Mentions: @username
- Various lengths for UI stability testing

### Next Steps

After seeding, you can:
1. **Run the demo script** to see the ranking algorithm in action:
   ```bash
   python scripts/demo_ranking.py techguru
   ```
2. Test the feed ranking algorithm with varied timestamps
3. Verify UTF-8 encoding through the Pydantic → React pipeline
4. Test Following vs Global feed differences
5. Develop and test new ranking algorithms with rich data
6. Use seeded users for integration testing

### Contributing

When adding new seeding features:
1. Maintain idempotency
2. Use realistic data (Faker preferred)
3. Document new configuration options
4. Test inside Docker container
5. Update this README
