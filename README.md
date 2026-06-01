# PulpBae Premium Beverage Website

PulpBae is a premium, dark-mode beverage startup landing page built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and MongoDB Atlas.

## Project Structure

```txt
PulpBae/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── images/
│   │   ├── pulpbae-logo.png
│   │   ├── orange-juice.png
│   │   ├── coconut-water.png
│   │   └── lime-juice.png
│   └── assets/
│       └── config.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── models/
│   │   └── OrderCounter.js
│   ├── routes/
│   │   └── orders.js
│   └── .env.example
└── README.md
```

## Features

- Sticky glassmorphism navbar with logo, favicon, smooth scrolling, and mobile menu.
- Animated hero section with floating fruit bubbles, glowing gradients, and product bottle showcase.
- Premium product cards for Orange Juice, Coconut Water, and Lime Juice.
- MongoDB Atlas-backed private click tracking for the `Order Now` button.
- API routes: `GET /api/orders`, `POST /api/orders/increment`, and private product-card click tracking.
- Product cards and `Order Now` route visitors to `coming-soon.html`.
- Animated statistics, testimonials slider, newsletter UI, footer social icons, and launch banner.
- Deployment-ready frontend and backend separation.

## Local Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env` with your real MongoDB Atlas URI:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/pulpbae?retryWrites=true&w=majority
MONGODB_DB_NAME=pulpbae
CORS_ORIGIN=http://127.0.0.1:8080,http://127.0.0.1:5500,http://localhost:5500,http://localhost:5173,http://localhost:3000
```

Important: `MONGODB_DB_NAME=pulpbae` forces the counter into the `pulpbae` database even if your Atlas URI accidentally defaults to `test`.
Local development also accepts any `localhost`, `127.0.0.1`, or `::1` frontend port automatically, including `http://127.0.0.1:8080`.

When the backend starts correctly, the terminal should show:

```txt
Connected to MongoDB Atlas database: pulpbae.
Order counter is ready in the orderCounters collection.
PulpBae API running on port 5000.
```

### 2. Frontend

Open `frontend/index.html` with a local static server. Beginner-friendly options:

```bash
cd frontend
npx serve .
```

Or use the VS Code Live Server extension.

The frontend reads the backend URL from `frontend/assets/config.js`:

```js
window.PULPBAE_API_URL = "http://localhost:5000";
```

## Private Click Tracking Troubleshooting

If clicks are not appearing in MongoDB, check these first:

1. Start the backend from the `backend` folder:

```bash
npm run dev
```

2. Visit this URL in your browser:

```txt
http://localhost:5000/api/orders
```

You should see JSON like:

```json
{
  "success": true,
  "totalOrders": 0
}
```

3. Refresh MongoDB Atlas or Compass. You should see:

```txt
pulpbae → orderCounters
```

4. If you only see the `test` database, your `MONGODB_URI` probably does not include `/pulpbae`.
5. If you only see the `test` database, make sure `MONGODB_DB_NAME=pulpbae` exists in `backend/.env`, then restart the backend.
6. If the terminal shows `CORS blocked`, restart the backend so the latest local-origin fix is loaded.
7. If the API does not open, check your Atlas username/password, Network Access IP settings, and whether the backend terminal has an error.

## MongoDB Atlas Deployment Steps

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free cluster.
2. Create a database user from **Database Access**.
3. Add your IP address from **Network Access**. For Render, allow access from anywhere using `0.0.0.0/0`.
4. Click **Connect** → **Drivers** → copy the MongoDB connection string.
5. Replace `<password>` with your real database password.
6. Use a database name like `pulpbae` in the URI.

Example:

```env
MONGODB_URI=mongodb+srv://pulpbae_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulpbae?retryWrites=true&w=majority
MONGODB_DB_NAME=pulpbae
```

## Render Backend Deployment

1. Push this project to GitHub.
2. Open [Render](https://render.com/), create a **New Web Service**, and connect the repository.
3. Set the root directory to `backend`.
4. Set the runtime to **Node**.
5. Set build command:

```bash
npm install
```

6. Set start command:

```bash
npm start
```

7. Add environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB_NAME=pulpbae
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

8. Deploy and copy the Render URL, for example:

```txt
https://pulpbae-api.onrender.com
```

## Vercel Frontend Deployment

1. Open [Vercel](https://vercel.com/) and import the GitHub repository.
2. Set the project root directory to `frontend`.
3. No build command is required for this static site.
4. Before deploying, update `frontend/assets/config.js`:

```js
window.PULPBAE_API_URL = "https://pulpbae-api.onrender.com";
```

5. Deploy and copy your frontend URL.
6. Add that frontend URL to Render's `CORS_ORIGIN` environment variable.

## Netlify Frontend Deployment

1. Open [Netlify](https://www.netlify.com/) and create a new site from Git.
2. Set base directory to `frontend`.
3. Leave build command empty.
4. Set publish directory to `frontend`.
5. Update `frontend/assets/config.js` with your Render backend URL before deployment:

```js
window.PULPBAE_API_URL = "https://pulpbae-api.onrender.com";
```

6. Add the Netlify site URL to Render's `CORS_ORIGIN` environment variable.

## API Reference

### GET `/api/orders`

Returns the current order click count.

```json
{
  "success": true,
  "totalOrders": 25
}
```

### POST `/api/orders/increment`

Increments the private `Order Now` button counter by one. This number is stored in MongoDB and is not displayed on the website.

```json
{
  "success": true,
  "totalOrders": 26
}
```

### POST `/api/products/click`

Records a product card click in MongoDB without showing the count to customers.

Request body:

```json
{
  "product": "orangeJuice"
}
```

Valid product values:

```txt
orangeJuice
coconutWater
limeJuice
```

MongoDB stores these under:

```txt
orderCounters.productClicks.orangeJuice
orderCounters.productClicks.coconutWater
orderCounters.productClicks.limeJuice
```

## Product Mapping

- `frontend/images/pulpbae-logo.png` is used in the footer, favicon, loader, and coming-soon page.
- `frontend/images/orange-juice.png` is used in the hero and Orange Juice product card.
- `frontend/images/coconut-water.png` is used in the Coconut Water product card.
- `frontend/images/lime-juice.png` is used in the Lime Juice product card.

## Notes

- Do not commit `backend/.env`.
- Private click tracking requires the backend to be running and connected to MongoDB Atlas.
- If the frontend is deployed separately, always update both `frontend/assets/config.js` and backend `CORS_ORIGIN`.
