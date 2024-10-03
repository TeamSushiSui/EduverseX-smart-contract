# Table of Contents

- [Setup Instructions](#setup-instructions)
- [Routes](#routes)

# Setup Instructions

To set up the API, follow these steps:

### Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: npm (Node Package Manager) is included with Node.js. You will use it to install dependencies.

### Steps to Set Up

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**
   Run the following command to install the required packages:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root of your project and add the following line:
   ```plaintext
   PRIVATE_KEY=your_private_key_here
   ```
   Replace `your_private_key_here` with your actual private key.

4. **Start the Server**
   Use the following command to start the server:
   ```bash
   npm run dev
   ```
   This will start the server in development mode.

5. **Access the API**
   Once the server is running, you can access the API at:
   ```
   http://localhost:3000
   ```

### Testing the API
You can use tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/) to test the API endpoints. Make sure to set the appropriate HTTP method (GET, POST, PUT, DELETE) and include any required request bodies.

### Troubleshooting
- If you encounter any issues, ensure that all dependencies are installed correctly and that your environment variables are set up properly.
- Check the console for any error messages that may indicate what went wrong.

# Routes

## NFT Routes
### 1. Get All NFTs
- **Endpoint:** `GET /nfts`
- **Description:** Retrieves all NFTs in the contract.
- **Response:** JSON array of NFT details.

### 2. Get NFT by ID
- **Endpoint:** `GET /nfts/:id`
- **Description:** Retrieves details of a specific NFT by its ID.
- **Response:** JSON object of the NFT details.
- **Error Response:** 404 if the NFT is not found.

### 3. Create a New NFT
- **Endpoint:** `POST /nfts`
- **Description:** Creates a new NFT.
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "image": "string"
  }
  ```
- **Response:** JSON object containing the ID and details of the created NFT.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 4. List NFT for Sale
- **Endpoint:** `PUT /nfts/list-for-sale`
- **Description:** Lists an NFT for sale.
- **Request Body:**
  ```json
  {
    "id": "string",
    "price": "number"
  }
  ```
- **Response:** JSON object of the updated NFT.
- **Error Response:** 400 for validation errors, 404 if the NFT is not found, 500 for server errors.

### 5. Remove NFT from Sale
- **Endpoint:** `PUT /nfts/remove-from-sale`
- **Description:** Removes an NFT from sale.
- **Request Body:**
  ```json
  {
    "id": "string"
  }
  ```
- **Response:** JSON object of the updated NFT.
- **Error Response:** 400 for validation errors, 404 if the NFT is not found, 500 for server errors.

## User Routes
### 1. Get User Details
- **Endpoint:** `GET /users/:id`
- **Description:** Retrieves details of a specific user by their ID.
- **Response:** JSON object of user details.
- **Error Response:** 404 if the user is not found.

### 2. Add a User
- **Endpoint:** `POST /users`
- **Description:** Adds a new user.
- **Request Body:**
  ```json
  {
    "name": "string",
    "userAdress": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors.

### 3. Remove a User
- **Endpoint:** `DELETE /users`
- **Description:** Removes a user by their address.
- **Request Body:**
  ```json
  {
    "userAdress": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors, 404 if the user is not found.

## Course Routes
### 1. Get All Courses
- **Endpoint:** `GET /courses`
- **Description:** Retrieves all courses in the contract.
- **Response:** JSON array of course details.

### 2. Get Course by ID
- **Endpoint:** `GET /courses/:id`
- **Description:** Retrieves details of a specific course by its ID.
- **Response:** JSON object of course details.
- **Error Response:** 404 if the course is not found.

### 3. Create a New Course
- **Endpoint:** `POST /courses`
- **Description:** Creates a new course.
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "creatorAddress": "string",
    "xp": "number",
    "difficulty": "number",
    "image": "string"
  }
  ```
- **Response:** JSON object containing the ID and details of the created course.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 4. Update a Course
- **Endpoint:** `PUT /courses`
- **Description:** Updates an existing course.
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "id": "string"
  }
  ```
- **Response:** JSON object of the updated course.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 5. Remove a Course
- **Endpoint:** `DELETE /courses/:id`
- **Description:** Deletes a course by its ID.
- **Response:** Confirmation message.
- **Error Response:** 404 if the course is not found.

### 6. Add a Question to a Course
- **Endpoint:** `POST /courses/add-question`
- **Description:** Adds a question to a specific course.
- **Request Body:**
  ```json
  {
    "course": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 7. Enroll a Student in a Course
- **Endpoint:** `POST /courses/enroll-student`
- **Description:** Enrolls a student in a specific course.
- **Request Body:**
  ```json
  {
    "course": "string",
    "student": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 8. Unenroll a Student from a Course
- **Endpoint:** `POST /courses/unenroll-student`
- **Description:** Unenrolls a student from a specific course.
- **Request Body:**
  ```json
  {
    "course": "string",
    "student": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 9. Add a Review to a Course
- **Endpoint:** `POST /courses/add-review`
- **Description:** Adds a review to a specific course.
- **Request Body:**
  ```json
  {
    "course": "string",
    "student": "string",
    "rating": "number",
    "review": "string"
  }
  ```
- **Response:** Confirmation message.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 10. Check Correct Answer for a Question
- **Endpoint:** `POST /courses/check-correct-answer`
- **Description:** Checks if the provided answer is correct for a question in a course.
- **Request Body:**
  ```json
  {
    "course": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response:** JSON object indicating if the answer is correct.
- **Error Response:** 400 for validation errors, 500 for server errors.

### 11. View Questions for a Course
- **Endpoint:** `GET /courses/:id/questions`
- **Description:** Retrieves questions for a specific course.
- **Response:** JSON array of questions.
- **Error Response:** 404 if questions are not found.

### 12. View Reviews for a Course
- **Endpoint:** `GET /courses/:id/reviews`
- **Description:** Retrieves reviews for a specific course.
- **Response:** JSON array of reviews.
- **Error Response:** 404 if reviews are not found.

## Notes
- Ensure to set the `PRIVATE_KEY` environment variable before starting the server.
- All responses are in JSON format.
- More routes are on the way.