# Comm-Sync-AI Frontend

A modern, fast, and scalable frontend built with **React** and **Vite**. This project serves as the user interface for the Comm-Sync-AI platform, providing authentication, project management, and real-time AI-powered features.

---

## 🚀 Features
- User authentication (register, login, OTP verification, logout)
- Project dashboard and management
- Real-time communication with backend via sockets
- AI-powered services integration
- Responsive and modern UI with Tailwind CSS
- Code splitting and fast refresh with Vite

---

## 📁 Folder Structure
```
frontend/
├── public/                # Static assets
├── src/                   # Source code
│   ├── assets/            # Images and SVGs
│   ├── auth/              # Authentication components
│   ├── config/            # Axios, socket, and web container configs
│   ├── context/           # React context providers
│   ├── routes/            # App route definitions
│   ├── screens/           # Main page components (Home, Login, Register, etc.)
│   ├── utils/             # Utility functions (e.g., OTP utils)
│   ├── App.jsx            # Main App component
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── package.json           # Project metadata and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```
The app will be available at `http://localhost:5173` by default.

### Building for Production
```bash
npm run build
# or
yarn build
```
The production-ready files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

---

## ⚙️ Environment Variables
Create a `.env` file in the `frontend/` directory for custom environment variables. Example:
```
VITE_API_URL=http://localhost:5000
```

---

## 🧹 Linting & Formatting
- **Lint:**
  ```bash
  npm run lint
  # or
  yarn lint
  ```
- ESLint and Prettier are configured for code quality and consistency.

---

## 🧩 Technologies Used
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Socket.io-client](https://socket.io/docs/v4/client-api/)
- [ESLint](https://eslint.org/)

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License.

---

## 📬 Contact
For questions or support, please open an issue or contact the maintainer.
