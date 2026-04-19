# 📈 Price Tracker & Deal Alert API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat&logo=render&logoColor=white)

A high-performance backend system built to track product prices across e-commerce platforms, store historical data, detect price drops, and send real-time alerts. Designed with modern architecture featuring dual-database optimization for relational and time-series data.

## 🔥 Key Features

- **Product Ingestion**: Submit URLs to track external product prices.
- **Node-Cron Background Polling**: A worker process checks active items every 5 minutes and updates external pricing.
- **Dual-Database Architecture**:
  - `PostgreSQL` (via Prisma): Manages structured User data, Products, and Subscription references.
  - `MongoDB` (via Mongoose): Optimally stores thousands of high-frequency Time-series tracking logs without bloating the relational schemas.
- **Automated Price Drop Alerts**: Leverages `Nodemailer` to automatically detect when a product drops below a user's target threshold and immediately triggers an HTML email to their inbox.
- **Secure Authentication**: Built-in JSON Web Tokens (JWT) routing with `bcrypt` password hashing.
- **Analytics Dashboarding**: Aggregation pipelines calculating average drops, minimum ranges, and tracking saturation using complex `$group` metrics.
- **Resiliency**: Fully engineered Map-based Rate Limiter to prevent DoS attacks.

## ⚙️ Tech Stack

- **Backend Framework:** Node.js, Express, TypeScript 
- **Databases:** PostgreSQL, MongoDB
- **ORMs:** Prisma Client, Mongoose
- **Task Scheduling:** node-cron
- **Mailing Integration:** Nodemailer
- **Authentication:** jsonwebtoken (JWT)
- **Deployment & Cloud:** Render (IaC Blueprinting)

## 📖 API Documentation

### 1. Authentication Endpoints

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "123", "name": "John" }`
- `POST /api/auth/login` - Authenticate and receive a JWT token
  - Body: `{ "email": "user@example.com", "password": "123" }`

### 2. Product Endpoints (Requires JWT)

- `GET /api/products` - List all products currently being tracked by the logged-in user.
  - Header: `Authorization: Bearer <token>`
- `POST /api/products` - Ingest a new product to track and add an instantaneous subscription.
  - Header: `Authorization: Bearer <token>`
  - Body: `{ "url": "https://amazon.com/product", "name": "Graphics Card", "targetPrice": 500 }`

### 3. Analytics Endpoints (Requires JWT)

- `GET /api/analytics/products/:id?rangeHours=24` - Fetch heavy analytical aggregation data. Returns the product's average tracked price, the all-time minimum within the active timeframe, and total concurrent subscribers trailing it.

## 🛠️ Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/price_tracker"
   MONGODB_URI="mongodb://localhost:27017/price_tracker"
   JWT_SECRET="changeme123"
   EMAIL_USER="your.email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

3. **Initialize the Relational Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

*(This project is fully configured for continuous automatic 1-click redeployments via Render using the `render.yaml` infrastructure-as-code configuration)*.
