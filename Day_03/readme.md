# 🧠 LeetCode Clone Backend – Authentication & Problem Schema (Day 3)

This project is part of a LeetCode-style platform where users can register/login and admins can upload coding problems. This file includes authentication routes (user & admin), secure logout using Redis, and a detailed Mongoose schema for coding problems.

---

## 📦 Features Implemented

### ✅ User Registration (`/register`)
- Registers a normal user.
- Validates request body using a `validate()` utility.
- Password is hashed using `bcrypt`.
- Role is set to `"user"` by default.
- JWT token is generated (valid for 1 hour) and stored in cookies.
- Returns: `"User Registered Successfully"`

---

### ✅ Admin Registration (`/admin/register`)
- Registers an **admin user** (protected using `adminMiddleware`).
- Similar to normal registration, but role is determined from request body (e.g., `"admin"`).
- JWT token is generated and stored in cookies.
- Returns: `"User Registered Successfully"`

---

### 🔐 Login (`/login`)
- Allows login using `emailId` and `password`.
- Finds user by `emailId` and compares hashed password using `bcrypt.compare()`.
- If credentials are valid, a JWT is issued and stored in cookies.
- Returns: `"Logged In Successfully"`
- Handles: Missing fields and invalid credentials.

---

### 🔓 Logout (`/logout`)
- Reads JWT token from cookie.
- Decodes token to get expiry time (`payload.exp`).
- Stores token in Redis with key: `token:<token>` and value `'Blocked'`.
- Sets Redis expiry to match token expiry.
- Clears cookie from browser.
- Returns: `"Logged Out Successfully"`

---
## 🧠 Code Explanation

### 🔧 `register` – Normal User Signup

```js
const register = async(req, res) => {
    try {
        validate(req.body); // Validate input fields

        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10); // Hash password
        req.body.role = 'user'; // Ensure role is set to user

        const user = await User.create(req.body); // Save to DB

        // Create JWT token valid for 1 hour
        const token = jwt.sign({ id: user._id, emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 3600 });

        // Set token in cookie
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

        res.status(201).send("User Registered Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}
```

---

### 🔐 `login` – User Login

```js
const login = async(req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        const match = await bcrypt.compare(password, user.password); // Compare passwords

        if (!match)
            throw new Error("Invalid Credentials");

        const token = jwt.sign({ _id: user._id, emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

        res.status(200).send("Logged In Successfully");
    } catch (err) {
        res.status(401).send("Error: " + err);
    }
}
```

---

### 🔓 `logout` – User Logout

```js
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token); // Decode token

        await redisClient.set(`token:${token}`, 'Blocked'); // Blacklist token
        await redisClient.expireAt(`token:${token}`, payload.exp); // Expire key at JWT's expiry

        res.cookie("token", null, { expires: new Date(Date.now()) }); // Clear cookie

        res.send("Logged Out Successfully");
    } catch (err) {
        res.status(503).send("Error: " + err);
    }
}
```

---

### 🛡️ `adminRegister` – Admin Signup

```js
const adminRegister = async(req, res) => {
    try {
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);

        const user = await User.create(req.body);

        const token = jwt.sign({ id: user._id, emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

        res.status(201).send("User Registered Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err);  
    }
}
```
---

## 🧰 Technology Stack

- **Node.js + Express** – Server and API development.
- **MongoDB + Mongoose** – Data persistence and schema modeling.
- **Redis** – Used for blacklisting tokens during logout.
- **JWT (jsonwebtoken)** – For authentication.
- **bcrypt** – For password hashing.
- **cookie-parser** – To manage cookies in Express.

---

## 🗃️ Problem Schema (`models/problem.js`)

Defines the format for coding problems admins can upload.

### 📄 Fields:

| Field             | Type        | Description                                               |
|-------------------|-------------|-----------------------------------------------------------|
| `title`           | String      | Title of the problem (required).                          |
| `description`     | String      | Full problem statement (required).                        |
| `difficulty`      | String      | Can be `easy`, `medium`, or `hard` (required).            |
| `tags`            | String      | Topic tag – `array`, `linkedlist`, `graph`, `dp`.         |
| `visibleTestCases`| Array       | Public test cases with input/output and explanations.     |
| `hiddenTestCases` | Array       | Hidden test cases for evaluation (input/output only).     |
| `startCode`       | Array       | Language-specific starter code templates.                 |
| `problemCreator`  | ObjectId    | Refers to the user who created the problem (required).    |

### 🧪 Test Case Format

```js
visibleTestCases: [
  {
    input: "5\n1 2 3 4 5",
    output: "15",
    explanation: "Sum of array elements"
  }
],
hiddenTestCases: [
  {
    input: "3\n100 200 300",
    output: "600"
  }
]

## 🧭 Route Summary (`routes/authRouter.js`)

| Method | Route               | Description              | Middleware         |
|--------|--------------------|--------------------------|--------------------|
| POST   | `/register`        | Register user            | –                  |
| POST   | `/login`           | Login user               | –                  |
| POST   | `/logout`          | Logout user              | `userMiddleware`   |
| POST   | `/admin/register`  | Register admin           | `adminMiddleware`  |

---

📂 Folder Structure
project/
│
├── config/
│   └── redis.js                # Redis client connection
│
├── controllers/
│   └── userAuthenticate.js     # Auth logic for register/login/logout
│
├── models/
│   ├── user.js                 # (Not shown here)
│   └── problem.js              # Mongoose schema for coding problems
│
├── middleware/
│   ├── userMiddleware.js       # Auth guard for users
│   └── adminMiddleware.js      # Auth guard for admins
│
├── routes/
│   └── authRouter.js           # Authentication-related routes
│
├── utils/
│   └── validator.js            # Body validation helper
│
└── .env                        # JWT secret key and environment config
