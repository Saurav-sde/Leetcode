# 🧠 LeetCode Clone (In Progress)

A full-stack web application that replicates LeetCode's core features — allowing users to register, solve coding problems, and track their progress.

---

## 🚀 Project Status

> 🔨 Currently building user authentication and backend structure.  
> ✅ Implemented:
- Express server setup
- MongoDB connection
- User schema (with roles and problem history)


## 🧪 Tech Stack

| Layer     | Tech                      |
|-----------|---------------------------|
| Backend   | Node.js, Express.js       |
| Database  | MongoDB, Mongoose         |
| Auth      | JWT (planned), Cookies    |
| Dev Tools | Postman, dotenv, Nodemon  |

---

## 🧾 User Schema Overview

```js
{
  firstName: String,      // required, min 3 chars
  lastName: String,       // optional
  emailId: String,        // unique, required, lowercase
  age: Number,            // optional, between 6 and 80
  role: "user" | "admin", // default: "user"
  problemSolved: [String] // array of problem IDs
}
