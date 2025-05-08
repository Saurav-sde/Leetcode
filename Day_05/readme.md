# LeetCode Clone – Problem Creation API

This project allows authenticated **admin users** to create coding problems that are verified against test cases using the [Judge0](https://judge0.com/) API.

---

## 🔧 Features Implemented

* ✅ Admin-protected API to create coding problems
* ✅ Automatic validation of reference solution using visible test cases
* ✅ Integration with Judge0 API for multi-language code execution
* ✅ Modular code structure using Express.js

---

## 📁 Project Structure

```
/controllers/
  userProblem.js        # Logic to handle problem creation

/models/
  problem.js            # Mongoose schema (not shown here)

/routes/
  problem.js            # Express routes for problem management

/utils/
  problemUtility.js     # Helper functions to interface with Judge0

/middleware/
  adminMiddleware.js    # Middleware to allow only admin users

.env                    # Environment file with API keys
README.md               # This documentation file
```

---

## ✨ API: Create Problem

**Route:** `POST /api/problem/create`
**Access:** Admin only
**Middleware:** `adminMiddleware`
**Purpose:** Creates a new coding problem after validating the reference solution against the visible test cases using Judge0.

### ✅ Request Body Format

```json
{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target...",
  "difficulty": "Easy",
  "tags": ["array", "hashmap"],
  "visibleTestCases": [
    { "input": "2\n7\n", "output": "0 1" }
  ],
  "hiddenTestCases": [
    { "input": "3\n10\n", "output": "1 2" }
  ],
  "startCode": [
    { "language": "c++", "code": "int twoSum(...) {...}" }
  ],
  "referenceSolution": [
    { "language": "c++", "completeCode": "#include<bits/stdc++.h> ..." }
  ],
  "problemCreator": "user_id_placeholder"
}
```

---

## 🧠 How It Works

### 1. Controller: `createProblem`

📍 **Location:** `/controllers/userProblem.js`

This function handles the creation of a coding problem:

1. Iterates through each `referenceSolution`.
2. Maps all `visibleTestCases` into Judge0-compatible format.
3. Submits test cases using `submitBatch()`.
4. Polls Judge0 with `submitToken()` until all test results are received.
5. If **any test case fails**, the problem is **not saved**.
6. If **all pass**, the problem is saved to MongoDB using the `Problem` model.

---

## 🔌 Judge0 Integration (`utils/problemUtility.js`)

### 🔹 `getLanguageById(lang)`

Maps a human-readable language string (e.g., `"c++"`, `"java"`) to its corresponding **Judge0 language ID**.

```js
const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };
  return language[lang.toLowerCase()];
}
```

---

### 🔹 `submitBatch(submissions)`

* Accepts an array of submissions (one per visible test case).
* Sends a `POST` request to **Judge0 `/submissions/batch`** endpoint.
* Returns an array of submission **tokens**.

```js
const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: {
      'x-rapidapi-key': 'your_rapidapi_key',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions }
  };

  const response = await axios.request(options);
  return response.data;
};
```

---

### 🔹 `submitToken(tokens[])`

* Accepts an array of Judge0 **submission tokens**.
* Continuously polls the `/submissions/batch` endpoint.
* Waits until all test cases have finished execution.
* Returns the **full results** of all submissions.

```js
const waiting = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE0_HOST_ID
    }
  };

  while (true) {
    const response = await axios.request(options);
    const result = response.data;
    const isDone = result.submissions.every(r => r.status_id > 2);

    if (isDone) return result.submissions;

    await waiting(1000); // wait 1 second before next poll
  }
};
```

---

## 📌 Notes

* Make sure your `.env` file contains valid values for `JUDGE0_API_KEY` and `JUDGE0_HOST_ID`.
* The `waiting()` function was previously implemented incorrectly using `setTimeout()`—it has been fixed to use Promises for proper async/await behavior.

---

## 🛡️ Authorization

* This route is protected by `adminMiddleware`, allowing only admins to create problems.
* Make sure the admin's auth token is validated in the middleware before reaching the controller.

---

## ✅ Next Steps (Future Improvements)

* Add update and delete problem APIs
* Add validation for input schema using Joi or Zod
* Add user-level submissions and scoring
* Add frontend UI for problem creation and submission

---

## 📫 Contact

For any queries, feel free to raise an issue or contact the maintainer.

---

Happy Coding! 🎯
