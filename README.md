
# 🛍️ Conversational E-Commerce Agent

A lightweight AI-powered shopping assistant embedded directly inside your e-commerce site. It mimics an in-store experience by asking natural questions, guiding users toward the right products, and creating a seamless, engaging purchase journey.

Built with **Next.js**, **Supabase**, and **Zustand**, ready for full-stack deployment on Vercel and Supabase.

---

## Features

- Smart assistant widget that interacts like a real salesperson
- Step-by-step question flow that narrows down user intent
- Live product suggestions based on answers
- Supabase auth + product database integration
- Logging and analytics-ready interaction tracking
- Easily extendable with OpenAI or custom chat logic

---

## Tech Stack

| Layer       | Technology            |
|------------|------------------------|
| Frontend   | Next.js (React)        |
| Backend    | Supabase (DB + Auth)   |
| State      | Zustand                |
| Styling    | Tailwind CSS (optional)|
| Deployment | Vercel + Supabase      |

---

## Project Structure

```bash
.
├── components/          # Reusable UI: Agent, ChatBubble, ProductCard
├── lib/                 # Supabase and chat logic
├── pages/               # Next.js routes and API endpoints
├── state/               # Zustand store for conversation flow
├── public/              # Static assets
├── .env.local           # Supabase + OpenAI keys
```

---

## Getting Started

1. **Clone the repo**
```bash
git clone https://github.com/your-username/ecommerce-agent.git
cd ecommerce-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.local.example .env.local
# Add your Supabase project keys
```

4. **Run locally**
```bash
npm run dev
```

5. **Visit the site**
```
http://localhost:3000
```

---

## Testing the Agent Flow

- Open the widget (bottom-right)
- Answer guided questions
- View live product suggestions
- All interactions are stored in Supabase

---

## Future Enhancements

- Integrate GPT-4 for smarter replies
- Add product deep links to PDPs
- Multilingual support with i18n
- Smart product recommendations with pgvector

---

## 🤝 Contributing

PRs welcome! If you have ideas for extending the agent, improving the logic flow, or adding connectors (e.g., Shopify, Stripe), feel free to fork and submit.

---

## 🛡️ License

MIT — use freely, attribute kindly.

---
