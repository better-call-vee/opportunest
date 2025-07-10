# 🎓 Opportunest

<a href="https://opportunest-9.web.app/" target="_blank">
 <img src="https://raw.githubusercontent.com/better-call-vee/opportunest/main/Opportunest.png" alt="Opportunest Banner"/>
</a>

<p align="center">
  <a href="https://opportunest9.web.app/" target="_blank">
    <strong>View Live Demo »</strong>
  </a>
</p>

<p align="center">
  Opportunest is a comprehensive, full-stack Scholarship Management System designed to connect students with global educational opportunities. It features a sophisticated multi-role architecture, enabling distinct dashboard experiences for users, moderators, and admins. From dynamic data visualization to secure, role-based CRUD operations, this project is a showcase of modern MERN stack development principles.
</p>

---

## ✨ Key Features

Opportunest is built with a focus on robust functionality, professional UI/UX, and a secure, scalable architecture.

- **🛡️ Multi-Role Architecture:**
  - **User Dashboard:** Allows users to manage their applications, submit reviews for scholarships, and edit or cancel their submissions.
  - **Moderator Dashboard:** Empowers moderators with full CRUD capabilities over scholarships, the ability to manage all user reviews, and tools to provide feedback on applications.
  - **Admin Dashboard:** Provides ultimate control, including all moderator privileges plus user management (deleting users, changing roles), and access to a platform-wide analytics dashboard.

 - **⚙️ High-Performance Data Management with Tanstack Query:**
  - All server-side data is managed through Tanstack Query, providing a seamless user experience with features like **caching, automatic refetching, and optimistic updates.**
  - Complex UI, such as the "Manage Users" and "Manage Applications" tables, features dynamic, server-side sorting and filtering that are directly integrated with Tanstack Query's `queryKey` system for maximum efficiency.


- **🎨 Eye-Catching & Interactive UI:**
  - **Physics-Based Animations:** The homepage banner features a dynamic background built with **GSAP** and an interactive **Matter.js** dot grid.
  - **3D Carousel:** A stunning, 3D "Coverflow" effect for the image slider, built with **Swiper.js**.
  - **Animated Analytics:** The admin dashboard features beautiful, animated charts built with **Recharts** to visualize platform statistics.
  - **Smooth Transitions:** **Framer Motion** is used throughout the application for page transitions, modal pop-ups, and scroll-triggered animations, creating a fluid user experience.

- **🌗 Persistent Light/Dark Mode:**
  - A seamless theme toggle that respects a user's system preference on their first visit and persists their choice in `localStorage`.

---

## 🐞 A Note on Debugging & Problem-Solving

A core part of this project was overcoming real-world development challenges. This demonstrates not just the ability to write code, but the critical skill of debugging a complex full-stack application.

> **The Challenge:** The deployed backend experienced intermittent `500 Internal Server Errors`, especially when fetching data immediately after a server restart. The user's role and other data would fail to load.
>
> **The Solution:** I identified this as a classic **race condition**. The Express server was starting to accept requests *before* the MongoDB client had successfully established its connection. The fix was to refactor the `index.js` file to ensure `app.listen()` is only called *after* the `await client.connect()` promise resolves, making the entire application startup process robust and reliable.

> **The Challenge:** The application form's image upload worked locally but consistently failed on the live server with a CORS error, even though the CORS policy was correct.
>
> **The Solution:** I diagnosed this as a security limitation where a third-party API (ImgBB) blocks direct requests from a browser. I engineered a professional solution by creating a backend proxy route (`/upload-image`). The frontend now securely sends the image to our own server, which then uses its secret API key to forward the image to ImgBB, completely solving the CORS issue and protecting the API key.

---

## 🛠️ Tech Stack & Architecture

### Architecture

- **Frontend:** React + Vite, deployed on **Firebase Hosting**.
- **Backend:** Node.js + Express, deployed as a serverless function on **Vercel**.
- **Database:** **MongoDB Atlas** (NoSQL Cloud Database).

### Frontend

| Technology | Description |
| :--- | :--- |
| **React** | Core UI framework for building modern, component-based interfaces. |
| **React Router DOM** | For all client-side routing and navigation. |
| **Tanstack Query** | For powerful, efficient server-state management, caching, and data fetching. |
| **Tailwind CSS** | A utility-first CSS framework for rapid and custom UI design. |
| **DaisyUI** | A component library for Tailwind CSS to streamline UI development. |
| **Firebase** | Handles user authentication (Email/Password, Google Sign-In). |
| **Framer Motion** | For creating beautiful, fluid animations and page transitions. |
| **Recharts** | For building the data visualization charts on the admin dashboard. |
| **Swiper.js** | Powers all carousels, including the 3D Coverflow and cinematic sliders. |
| **GSAP & Matter.js** | Used in combination to create the interactive physics-based animations in the banner. |
| **Axios** | For all client-server communication, including a secure instance with interceptors. |
| **React Hook Form** | For robust and performant form state management and validation. |
| **SweetAlert2** | For creating beautiful, custom alerts and confirmations. |

### Backend

| Technology | Description |
| :--- | :--- |
| **Node.js** | The JavaScript runtime for the server. |
| **Express.js** | A minimal and flexible framework for building the API and handling routes. |
| **MongoDB** | The NoSQL database used to store all application data. |
| **Firebase Admin SDK**| For securely verifying user identity tokens on the server-side. |
| **CORS** | Middleware to handle Cross-Origin Resource Sharing between the frontend and backend. |
| **Multer & Form-Data** | Used to handle `multipart/form-data` for the secure image upload proxy. |
| **dotenv** | For managing all secret environment variables securely. |

---

## 🚀 Getting Started

To get a local development copy running, follow these steps:

### 1. Clone and Set Up Backend

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to the server directory
cd <server-folder-name>

# Install dependencies
npm install

# Create a .env file
touch .env
