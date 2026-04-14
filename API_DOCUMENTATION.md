# 🎮 Game Data API Documentation

> **Version:** 2.0  
> **Base URL:** `https://your-domain.com/api`  
> **Last Updated:** February 2026

---

## 📖 Overview

এই API ব্যবহার করে আপনি আমাদের platform এর সকল **Game Providers** এবং **Games** এর তথ্য পাবেন। প্রাপ্ত data ব্যবহার করে আপনি সরাসরি game launch করতে পারবেন। বর্তমানে আমাদের database এ:

| 📊 Stats | Count |
|----------|-------|
| Total Providers | 76+ |
| Total Games | 4,500+ |
| Slot Games | 3,891+ |
| Casino Games | 17+ |
| Fishing Games | 36+ |
| Game Types | 18 |

---

## 🔐 Authentication

সকল API request এ Header এ আপনার API Key পাঠাতে হবে:

```
x-api-key: YOUR_API_KEY_HERE
```

| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | আপনার unique API key | ✅ **Yes** |
| `Content-Type` | `application/json` | Optional |

### ❌ API Key ছাড়া Request করলে কী হবে?

```bash
curl -X GET https://your-domain.com/api/games
```

**Response (401):**
```json
{
  "success": false,
  "message": "API key is required. Please provide x-api-key header."
}
```

### ❌ ভুল API Key দিলে?

```json
{
  "success": false,
  "message": "Invalid API key."
}
```

### ❌ আপনার API access যদি disable করা থাকে?

```json
{
  "success": false,
  "message": "Your API access has been disabled. Contact admin."
}
```

---

## 🎯 Game Launch Data — কীভাবে Game Launch করবেন?

আমাদের API থেকে প্রাপ্ত data দিয়ে game launch করতে হবে। এখানে **3টি field** মূল ভূমিকা পালন করে:

### Launch URL

```
POST https://crazybet99.com/getgameurl/v2
```

### Launch Headers

```
x-dstgame-key: YOUR_DST_GAME_KEY
```

### Launch Body (JSON)

```json
{
    "username": "player123",
    "money": 1000,
    "game_code": "value_from_our_api",
    "provider_code": "value_from_our_api",
    "game_type": "value_from_our_api"
}
```

---

### 📋 Launch Data Mapping — কোন Field কোথা থেকে আসবে?

| Launch Field | আমাদের API Response Field | বর্ণনা |
|:-------------|:---------------------------|:-------|
| `game_code` | `data.game_code` | Game এর unique code |
| `provider_code` | `data.provider.provider_code` | Provider code |
| `game_type` | `data.game_type` | Game type (SLOT, CASINO, etc.) |
| `username` | — | আপনার player এর username |
| `money` | — | Player এর balance amount |

---

### 🎰 Example 1: নির্দিষ্ট SLOT Game Launch করা

**Step 1:** আমাদের API থেকে game data নিন:
```bash
GET /api/games/6995d011eaec89ff53ba5170
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6995d011eaec89ff53ba5170",
    "game_code": "gpas_1reeler_pop",
    "gameName": "1-Of-A-Kind",
    "game_type": "SLOT",
    "image": "https://img.capalangresource.com/images/public/images/games/pts/gpas_1reeler_pop.png",
    "rtp": 100,
    "provider": {
      "provider_code": "PTS",
      "providerName": "PLAYTECH SEAMLESS",
      "gameType": "CASINO"
    }
  }
}
```

**Step 2:** এই data দিয়ে Launch request তৈরি করুন:
```json
{
  "username": "player123",
  "money": 1000,
  "game_code": "gpas_1reeler_pop",
  "provider_code": "PTS",
  "game_type": "SLOT"
}
```

**Step 3:** Launch URL এ POST করুন → Game URL পাবেন:
```json
{
  "joyhobe": "https://game-launch-url.com/..."
}
```

---

### 🎲 Example 2: JILI Game Launch করা

**Step 1:** JILI provider এর games দেখুন:
```bash
GET /api/providers/JILIS
```

**Step 2:** পছন্দের game বাছাই করুন:
```json
{
  "_id": "6995d018eaec89ff53ba5abc",
  "game_code": "jili_crazyhunter",
  "gameName": "Crazy Hunter",
  "game_type": "SLOT",
  "image": "https://img.capalangresource.com/images/.../crazyhunter.png",
  "provider_code": "JILIS"
}
```

**Step 3:** Launch body:
```json
{
  "username": "player456",
  "money": 500,
  "game_code": "jili_crazyhunter",
  "provider_code": "JILIS",
  "game_type": "SLOT"
}
```

---

### 🏢 Example 3: Provider Lobby Open করা (game_code নেই)

যদি কোনো নির্দিষ্ট game না থাকে, তাহলে provider এর **lobby** open হবে:

```json
{
  "username": "player789",
  "money": 2000,
  "game_code": 0,
  "provider_code": "SPRIBE",
  "game_type": 0
}
```

> **`game_code: 0`** এবং **`game_type: 0`** মানে হলো নির্দিষ্ট কোনো game না — পুরো provider এর lobby দেখাবে যেখান থেকে player নিজে game বাছাই করতে পারবে।

---

### 💻 Full Code Example (JavaScript/Node.js)

```javascript
const axios = require('axios');

// Step 1: আমাদের API থেকে game data নিন
const getGameInfo = async (gameId) => {
  const response = await axios.get(`https://your-domain.com/api/games/${gameId}`, {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  return response.data.data;
};

// Step 2: Game Launch করুন
const launchGame = async (gameId, username, money) => {
  // আমাদের API থেকে game info নিন
  const game = await getGameInfo(gameId);

  // Launch request তৈরি করুন
  const launchData = {
    username: username,
    money: money,
    game_code: game.game_code,            // আমাদের API থেকে
    provider_code: game.provider.provider_code,  // আমাদের API থেকে
    game_type: game.game_type              // আমাদের API থেকে
  };

  // Game launch URL পান
  const result = await axios.post('https://crazybet99.com/getgameurl/v2', launchData, {
    headers: { 'x-dstgame-key': 'YOUR_DST_KEY' }
  });

  return result.data.joyhobe; // Game URL
};

// Usage
const gameUrl = await launchGame('6995d011eaec89ff53ba5170', 'player123', 1000);
console.log('Game URL:', gameUrl);
// Open this URL in browser/iframe to play the game!
```

---

### 🐍 Full Code Example (Python)

```python
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://your-domain.com/api"

# Step 1: Game data নিন
def get_game_info(game_id):
    response = requests.get(
        f"{BASE_URL}/games/{game_id}",
        headers={"x-api-key": API_KEY}
    )
    return response.json()["data"]

# Step 2: Game Launch করুন
def launch_game(game_id, username, money):
    game = get_game_info(game_id)

    launch_data = {
        "username": username,
        "money": money,
        "game_code": game["game_code"],
        "provider_code": game["provider"]["provider_code"],
        "game_type": game["game_type"]
    }

    result = requests.post(
        "https://crazybet99.com/getgameurl/v2",
        json=launch_data,
        headers={"x-dstgame-key": "YOUR_DST_KEY"}
    )

    return result.json()["joyhobe"]

# Usage
game_url = launch_game("6995d011eaec89ff53ba5170", "player123", 1000)
print(f"Game URL: {game_url}")
```

---

### 🌐 Full Code Example (PHP)

```php
<?php
$apiKey = "YOUR_API_KEY";
$baseUrl = "https://your-domain.com/api";

// Step 1: Game data নিন
function getGameInfo($gameId) {
    global $apiKey, $baseUrl;

    $ch = curl_init("$baseUrl/games/$gameId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-api-key: $apiKey"]);
    $response = json_decode(curl_exec($ch), true);
    curl_close($ch);

    return $response["data"];
}

// Step 2: Game Launch করুন
function launchGame($gameId, $username, $money) {
    $game = getGameInfo($gameId);

    $launchData = json_encode([
        "username"      => $username,
        "money"         => $money,
        "game_code"     => $game["game_code"],
        "provider_code" => $game["provider"]["provider_code"],
        "game_type"     => $game["game_type"]
    ]);

    $ch = curl_init("https://crazybet99.com/getgameurl/v2");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $launchData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-dstgame-key: YOUR_DST_KEY"
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);

    return $result["joyhobe"];
}

// Usage
$gameUrl = launchGame("6995d011eaec89ff53ba5170", "player123", 1000);
echo "Game URL: $gameUrl";
?>
```

---

---

# 📘 API Endpoints — বিস্তারিত উদাহরণ সহ

---

## 1️⃣ GET /api/providers — সকল Providers

সকল available game providers এর তালিকা পান।

```bash
curl -X GET https://your-domain.com/api/providers \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Success Response (200):**
```json
{
  "success": true,
  "count": 76,
  "data": [
    {
      "_id": "6995cf8feaec89ff53ba50a3",
      "providerCode": "TBC",
      "providerName": "2BC",
      "gameType": "SPORTS"
    },
    {
      "_id": "6995cf8feaec89ff53ba50a5",
      "providerCode": "WIN568S",
      "providerName": "568WIN SPORTS (PHP ONLY)",
      "gameType": "SPORTS"
    },
    {
      "_id": "6995cf8feaec89ff53ba50b3",
      "providerCode": "KINGH5",
      "providerName": "888King H5",
      "gameType": "SLOT"
    },
    {
      "_id": "6995cf8feaec89ff53ba50b5",
      "providerCode": "ACEWINS",
      "providerName": "AceWin Seamless",
      "gameType": "SLOT"
    }
  ]
}
```

### 📌 কখন ব্যবহার করবেন?
- Website/App এ provider list দেখানোর জন্য
- Dropdown/Filter menu তৈরি করতে
- Provider ভিত্তিক category তৈরি করতে

---

## 2️⃣ GET /api/providers/:providerCode — Provider + Games

একটি নির্দিষ্ট provider এর সম্পূর্ণ তথ্য + তার সকল games।

### Example A: SPRIBE Provider এর সব Games

```bash
curl -X GET https://your-domain.com/api/providers/SPRIBE \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "provider": {
    "_id": "6995cf8feaec89ff53ba50ab",
    "providerCode": "SPRIBE",
    "providerName": "SPRIBE",
    "gameType": "SLOT"
  },
  "gameCount": 18,
  "games": [
    {
      "_id": "6995d020eaec89ff53ba5987",
      "game_code": "aviator",
      "gameName": "Aviator",
      "game_type": "CRASH",
      "jackpot": "FALSE",
      "image": "https://img.capalangresource.com/images/...",
      "freeTry": "FALSE",
      "seq": 1,
      "rtp": 97,
      "provider_code": "SPRIBE"
    },
    {
      "_id": "6995d020eaec89ff53ba5988",
      "game_code": "mines",
      "gameName": "Mines",
      "game_type": "CRASH",
      "jackpot": "FALSE",
      "image": "https://img.capalangresource.com/images/...",
      "freeTry": "FALSE",
      "seq": 2,
      "rtp": 97,
      "provider_code": "SPRIBE"
    }
  ]
}
```

### Example B: JILI Provider এর সব Games

```bash
curl -X GET https://your-domain.com/api/providers/JILIS \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "provider": {
    "_id": "6995cf8feaec89ff53ba50a9",
    "providerCode": "JILIS",
    "providerName": "JILI GAMING SEAMLESS",
    "gameType": "SLOT"
  },
  "gameCount": 80,
  "games": [
    {
      "_id": "6995d018eaec89ff53ba5170",
      "game_code": "jili_crazyhunter",
      "gameName": "Crazy Hunter",
      "game_type": "SLOT",
      "jackpot": "FALSE",
      "image": "https://img.capalangresource.com/images/.../crazyhunter.png",
      "freeTry": "FALSE",
      "seq": 1,
      "rtp": 100,
      "provider_code": "JILIS"
    }
  ]
}
```

### Example C: PRAGMATIC PLAY Provider

```bash
curl -X GET https://your-domain.com/api/providers/PPDSO \
  -H "x-api-key: YOUR_API_KEY"
```

### Example D: Provider নেই (Error)

```bash
curl -X GET https://your-domain.com/api/providers/INVALID_CODE \
  -H "x-api-key: YOUR_API_KEY"
```

**❌ Response (404):**
```json
{
  "success": false,
  "message": "Provider not found"
}
```

### 📌 কখন ব্যবহার করবেন?
- Provider এর page/section এ তার সব games দেখানোর জন্য
- Provider wise game browsing
- "JILI Games", "SPRIBE Games" ইত্যাদি category page তৈরি করতে

---

## 3️⃣ GET /api/games — সকল Games (Pagination + Filter)

সকল games পান। Pagination ও filtering support করে।

### Example A: প্রথম Page (Default — 50 games per page)

```bash
curl -X GET https://your-domain.com/api/games \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 4509,
  "page": 1,
  "limit": 50,
  "totalPages": 91,
  "data": [
    {
      "_id": "6995d011eaec89ff53ba5062",
      "game_code": "gpas_1reeler_pop",
      "gameName": "1-Of-A-Kind",
      "game_type": "SLOT",
      "jackpot": "FALSE",
      "image": "https://img.capalangresource.com/images/public/images/games/pts/gpas_1reeler_pop.png",
      "freeTry": "FALSE",
      "seq": 1,
      "rtp": 100,
      "provider": {
        "provider_code": "PTS",
        "providerName": "PLAYTECH SEAMLESS",
        "gameType": "CASINO"
      }
    }
  ]
}
```

### Example B: Pagination — 2য় Page, প্রতি page এ 20টি

```bash
curl -X GET "https://your-domain.com/api/games?page=2&limit=20" \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 4509,
  "page": 2,
  "limit": 20,
  "totalPages": 226,
  "data": [ ... ]
}
```

### Example C: শুধু SLOT Games filter করুন

```bash
curl -X GET "https://your-domain.com/api/games?gameType=SLOT" \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 3891,
  "page": 1,
  "limit": 50,
  "totalPages": 78,
  "data": [ ... ]
}
```

### Example D: শুধু CASINO Games

```bash
curl -X GET "https://your-domain.com/api/games?gameType=CASINO" \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 17,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "data": [ ... ]
}
```

### Example E: শুধু FISHING Games

```bash
curl -X GET "https://your-domain.com/api/games?gameType=FISHING" \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 36,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "data": [ ... ]
}
```

### Example F: নির্দিষ্ট Provider এর Games (e.g. JILI)

```bash
curl -X GET "https://your-domain.com/api/games?providerCode=JILIS" \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "count": 80,
  "page": 1,
  "limit": 50,
  "totalPages": 2,
  "data": [
    {
      "_id": "6995d018eaec89ff53ba5170",
      "game_code": "jili_crazyhunter",
      "gameName": "Crazy Hunter",
      "game_type": "SLOT",
      "jackpot": "FALSE",
      "image": "https://img.capalangresource.com/images/.../crazyhunter.png",
      "rtp": 100,
      "provider": {
        "provider_code": "JILIS",
        "providerName": "JILI GAMING SEAMLESS",
        "gameType": "SLOT"
      }
    }
  ]
}
```

### Example G: Filter + Pagination একসাথে — SLOT Games, Page 3, 10 per page

```bash
curl -X GET "https://your-domain.com/api/games?gameType=SLOT&page=3&limit=10" \
  -H "x-api-key: YOUR_API_KEY"
```

### Example H: নির্দিষ্ট Provider + Game Type — JILI এর FISHING Games

```bash
curl -X GET "https://your-domain.com/api/games?providerCode=JILIS&gameType=FISHING" \
  -H "x-api-key: YOUR_API_KEY"
```

### 📋 Query Parameters Summary

| Parameter | Type | Default | Example | Description |
|:----------|:-----|:--------|:--------|:------------|
| `page` | Number | `1` | `?page=3` | কোন page দেখতে চান |
| `limit` | Number | `50` | `?limit=20` | প্রতি page এ কতগুলো game |
| `gameType` | String | All | `?gameType=SLOT` | Game type দিয়ে filter |
| `providerCode` | String | All | `?providerCode=JILIS` | Provider দিয়ে filter |

### 📌 কখন ব্যবহার করবেন?
- Home page এ সব games দেখাতে
- Category page (Slots, Casino, Fishing, etc.)
- Infinite scroll / Load more feature
- Search ও filter functionality
- Provider specific game listing

---

## 4️⃣ GET /api/games/:id — Single Game (ID দিয়ে)

নির্দিষ্ট game এর পূর্ণ তথ্য + provider info। MongoDB `_id` ব্যবহার করে query করুন।

### Example A: PLAYTECH Game

```bash
curl -X GET https://your-domain.com/api/games/6995d011eaec89ff53ba5062 \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6995d011eaec89ff53ba5062",
    "game_code": "gpas_1reeler_pop",
    "gameName": "1-Of-A-Kind",
    "game_type": "SLOT",
    "jackpot": "FALSE",
    "image": "https://img.capalangresource.com/images/public/images/games/pts/gpas_1reeler_pop.png",
    "eventGameType": null,
    "freeTry": "FALSE",
    "seq": 1,
    "rtp": 100,
    "balance": null,
    "provider": {
      "provider_code": "PTS",
      "providerName": "PLAYTECH SEAMLESS",
      "gameType": "CASINO"
    }
  }
}
```

### Example B: JILI Game

```bash
curl -X GET https://your-domain.com/api/games/6995d018eaec89ff53ba5170 \
  -H "x-api-key: YOUR_API_KEY"
```

**✅ Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6995d018eaec89ff53ba5170",
    "game_code": "jili_crazyhunter",
    "gameName": "Crazy Hunter",
    "game_type": "SLOT",
    "jackpot": "FALSE",
    "image": "https://img.capalangresource.com/images/.../crazyhunter.png",
    "eventGameType": null,
    "freeTry": "FALSE",
    "seq": 1,
    "rtp": 100,
    "balance": null,
    "provider": {
      "provider_code": "JILIS",
      "providerName": "JILI GAMING SEAMLESS",
      "gameType": "SLOT"
    }
  }
}
```

### Example C: Invalid ID

```bash
curl -X GET https://your-domain.com/api/games/invalid_id_here \
  -H "x-api-key: YOUR_API_KEY"
```

**❌ Response (400):**
```json
{
  "success": false,
  "message": "Invalid game ID format"
}
```

### Example D: Valid ID but Game নেই

```bash
curl -X GET https://your-domain.com/api/games/6995d011eaec89ff53ba0000 \
  -H "x-api-key: YOUR_API_KEY"
```

**❌ Response (404):**
```json
{
  "success": false,
  "message": "Game not found"
}
```

### 📌 কখন ব্যবহার করবেন?
- Game details page — যখন user একটি game এ click করে
- Game launch — launch এর আগে full info নিতে
- Game info modal/popup দেখাতে

### 🎮 এই Response দিয়ে কীভাবে Game Launch করবেন?

```javascript
// 1. Single game API থেকে data নিন
const game = response.data;

// 2. Launch body তৈরি করুন
const launchBody = {
  username: "player123",        // আপনার player
  money: 1000,                  // Player balance
  game_code: game.game_code,    // API থেকে — "jili_crazyhunter"
  provider_code: game.provider.provider_code,  // API থেকে — "JILIS"
  game_type: game.game_type     // API থেকে — "SLOT"
};

// 3. Launch!
POST https://crazybet99.com/getgameurl/v2
Headers: { "x-dstgame-key": "YOUR_KEY" }
Body: launchBody
```

---

---

# 📋 Data Reference

## Available Game Types

| Game Type | বর্ণনা | Games Count |
|:----------|:-------|:------------|
| `SLOT` | Slot Machine Games | 3,891+ |
| `CASINO` | Live Casino Games | 17+ |
| `FISHING` | Fishing Games | 36+ |
| `CRASH` | Crash Games (e.g. Aviator) | Available |
| `SPORTS` | Sports Betting | Available |
| `ARCADE` | Arcade Games | Available |
| `CARD` | Card Games | Available |
| `COCKFIGHT` | Cockfight Games | Available |
| `CRICKET` | Cricket | Available |
| `ESPORT` | E-Sports | Available |
| `GALAXY` | Galaxy Games | Available |
| `HORSEBOOK` | Horse Racing | Available |
| `LIVE` | Live Games | Available |
| `LOTTERY` | Lottery | Available |
| `NUMBER` | Number Games | Available |
| `POKER` | Poker | Available |
| `TABLE` | Table Games | Available |

---

## Available Providers (76+)

### 🎰 SLOT Providers

| Provider Code | Provider Name |
|:--------------|:-------------|
| `JILIS` | JILI GAMING SEAMLESS |
| `SPRIBE` | SPRIBE |
| `PPDSO` | PRAGMATIC PLAY (NEW) |
| `PGSS` | PGSOFT SEAMLESS |
| `FC` | FaChai |
| `PS` | PlayStar |
| `EDP` | Endorphina Slots |
| `NES` | NET ENT SEAMLESS |
| `RTS` | RED TIGER SEAMLESS |
| `BTGS` | BIG TIME GAMING SEAMLESS |
| `NLCS` | NO LIMIT CITY SEAMLESS |
| `HACKSAW` | HACKSAW SLOTS |
| `NEXTSPIN` | NEXTSPIN |
| `SMARTS` | SMARTSOFT |
| `GENESIS` | GENESIS |
| `FASTSPIN` | FASTSPIN |
| `BOGSO` | BNG |
| `MASCOT` | MASCOT GAMING |
| `SPS` | SIMPLE PLAY |
| `AVIATRIX` | Aviatrix |
| `LMONACO_UNI` | Lucky Monaco |
| `KINGH5` | 888King H5 |
| `LUDOBET` | Ludo Bet |
| `ACEWINS` | AceWin Seamless |
| `KAGAMING` | KA Gaming Seamless |
| `BPOT_UNI` | Bigpot Gaming |
| `ADVANT_UNI` | ADVANTPLAY |
| `WEGAMING` | WE GAMING |
| `DSTPLAY` | DSTPLAY |
| `GAMEBEAT_UNI` | GAMEBEAT |
| `IBEX_UNI` | IBEX |
| `IDG_UNI` | IDG |
| `BG_UNI` | BGAMING |
| `JDBS` | JDB |
| `KMSO` | KINGMAKER |
| `MARIOSO` | MARIO CLUB |
| `JKSO` | JOKER |
| `WMGSO` | World Match |
| `HBRDS` | HABANERO |
| `PITTAPLUS_UNI` | PITTA PLUS |
| `PNGS` | PLAY N GO |
| `NETG_UNI` | NET GAMING |
| `PIXMOVE` | PIXMOVE |
| `IMOON` | IMOON |
| `DSO` | DRAGOON SOFT |
| `BARBARA_UNI` | BARBARA BANG |
| `PHOENIX7_UNI` | PHOENIX7 |
| `VA_UNI` | VA GAMING |
| `INOUT` | INOUT |

### 🎲 CASINO Providers

| Provider Code | Provider Name |
|:--------------|:-------------|
| `DGDS` | DREAM GAMING SEAMLESS |
| `KING855S` | KING855 SEAMLESS |
| `WMCDS` | WM CASINO SEAMLESS |
| `EVODO` | EVOLUTION SEAMLESS (NEW) |
| `PPLCO` | PRAGMATIC LIVE (NEW) |
| `VGS` | VIVO GAMING |
| `SADSO` | SA GAMING |
| `PTS` | PLAYTECH SEAMLESS |
| `ASTAR` | ASTAR |
| `EZUGIS` | EZUGI |
| `ABSO` | ALLBETS SEAMLESS |
| `AMIGO` | AMIGO GAMING |
| `AWCSO` | SEXY BACCARAT |
| `AGDSO` | ASIA GAMINGS |
| `YBS` | YEEBET |

### ⚽ SPORTS Providers

| Provider Code | Provider Name |
|:--------------|:-------------|
| `TBC` | 2BC |
| `SABA` | SABA Sports |
| `OBET` | OBET Sports |
| `LUCKYSPORTS` | LUCKY SPORTS |
| `WEBET` | WBET SPORTS |
| `WS` | WS SPORTS |
| `SBOS` | SBOBET |
| `WIN568S` | 568WIN SPORTS (PHP ONLY) |

### 🎯 Other Providers

| Provider Code | Provider Name | Type |
|:--------------|:-------------|:-----|
| `DS88` | DS88 | COCKFIGHT |
| `ASPECTS` | ASPECT GAMING SEAMLESS | HORSEBOOK |
| `TVBET` | TVBET | LOTTERY |
| `BGSO` | BIG GAMES | CASINO,SLOT,FISHING |

---

## ❌ Error Response Reference

| HTTP Code | মানে কী | কখন হয় |
|:----------|:--------|:--------|
| `200` | ✅ Success | সব ঠিক আছে |
| `400` | ❌ Bad Request | ভুল parameter বা invalid ID format |
| `401` | 🔒 Unauthorized | API key নেই বা ভুল |
| `403` | 🚫 Forbidden | API access disable করা আছে |
| `404` | 🔍 Not Found | Game বা Provider পাওয়া যায়নি |
| `500` | 💥 Server Error | Server এ সমস্যা |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description in English"
}
```

---

## ⚡ Rate Limiting

| Plan | Requests / Minute |
|:-----|:-------------------|
| Basic | 60 |
| Pro | 300 |
| Enterprise | Unlimited |

> Rate limit exceed হলে `429 Too Many Requests` response আসবে।

---

## 📞 Support

কোনো সমস্যা হলে যোগাযোগ করুন:
- 📧 Email: support@your-domain.com
- 💬 Telegram: @your_telegram
