# shopping-cart-api

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

# Things to Ensure Are Working

### MongoDB
- **Confirm MongoDB is installed** and running on your machine or server.
- **Default Port**: MongoDB typically runs on **PORT 27017**. Ensure this port is available or adjust your application’s MongoDB connection configuration if needed.
- **Check Connection**: Verify the connection by running:

  ```bash
  mongo --eval 'db.runCommand({ connectionStatus: 1 })'
  ```
  - If this outputs a status of `ok: 1`, MongoDB is correctly set up.

### Redis
- **Confirm Redis is installed** and running on your machine or server.
- **Default Port**: Redis typically runs on **PORT 6379**. Ensure this port is available or adjust your application’s Redis connection settings as needed.
- **Check Connection**: You can test Redis by running:

  ```bash
  redis-cli ping
  ```
  - If this outputs `PONG`, Redis is correctly set up.

By ensuring both MongoDB and Redis are running and reachable on their respective ports, your application should be ready to connect to these services without any issues.

# Configuring SMTP Protocol for Email

To configure SMTP for sending emails, you’ll need to set up environment variables for the SMTP server details. Below is a basic configuration setup.

### 1. Environment Variables
Add the following environment variables to your `.env` file (or your environment configuration):

```plaintext
SMTP_SERVER=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-email-username
SMTP_PASSWORD=your-email-password
```

# Optional .env Configuration

In addition to the SMTP configuration, you may want to include settings for Redis and your database in your `.env` file. Below are the optional environment variables you can set up.

### 1. Redis Configuration

Add the following Redis-related variables:

```plaintext
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 2. Database Configuration

Add the following database-related variables:

```plaintext
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_USER=your-db-username
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name
```

### 3. Example .env File

Here’s how your complete `.env` file might look with SMTP, Redis, and database configurations:

```plaintext
SMTP_SERVER=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-email-username
SMTP_PASSWORD=your-email-password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_USER=your-db-username
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name
```



### 4. Important Notes

- Ensure you have a `.env` file in the root of your project and that it is included in your `.gitignore` file to avoid exposing sensitive information.
- Make sure to install any necessary libraries for Redis and your database (e.g., `redis` for Redis and `mongosh` for MongoDB).


# Steps to Start the Application

### Prerequisites

- Ensure **Node.js** is installed.
- Confirm that **PORT 3000** (for the main API server) and **PORT 3001** (for the recommender service) are available and not occupied by any other services.

### Steps

1. **Install dependencies**

   In the project root directory, run:
   ```bash
   npm install
   ```
2. **Running Migrations with Yarn/NPM**

   ###### Important Database Migration Note
     Before starting the application, it is essential to run the database migration command using either Yarn or NPM. This step is crucial for the following reasons:

  - 1. **Populating the Database**:
      - The migration command utilizes YAML data from the fixtures directory to populate the database with initial data. This includes setting up essential records that your application may require to function correctly.

  - 2. **Setting Up Relationships**:
      - Migrations help establish the relationships between different models and ensure that foreign keys and indexes are correctly configured. This is vital for maintaining data integrity and optimizing query performance.

  - 3. **Data Consistency**:
      - Running migrations ensures that the database schema is in sync with the application models. This consistency is critical for avoiding runtime errors related to missing tables, columns, or relationships.

  - 4. **Easier Testing**:
      - With a pre-populated database, This makes testing and development more efficient.

  - #### How to Run Migrations

    To run the migration, execute one of the following commands in your terminal:
    # Using Yarn
    ```bash
    yarn migrate
    ```
    Or
    # Using NPM
    ```bash
    npm run migrate
    ```
3. **Open two terminal windows**

   - **Terminal 1**: For the main application server.
   - **Terminal 2**: For the recommender service.

4. **Start the main application** in Terminal 1:

   ```bash
   npm run start
   ```

   - This command will start the main LoopBack application on **PORT 3000**.
   - Confirm it’s running by checking the output for `Server is running at http://localhost:3000`.

5. **Start the recommender service** in Terminal 2:

   ```bash
   npm run start:recommender
   ```

   - This will start the recommender service on **PORT 3001**.

6. **Verify both services**

   - The main application should be accessible at `http://localhost:3000`.
   - The recommender service should be running at `http://localhost:3001`.

Now, both the main application and recommender service are up and running, ready to handle requests on their respective ports.





# Accessing the Swagger Documentation

To access the Swagger API documentation for your application, navigate to:

- **URL**: [http://127.0.0.1:3000/explorer](http://127.0.0.1:3000/explorer)

This page will provide an interactive UI to explore and test all available endpoints for the application.

---

### Available Controllers and Endpoints

Here is an overview of the main controllers and their routes within the API:

---

#### **CartController**

- **Add Item to Cart**
  **POST** `/carts/{userId}/items`

- **Create Cart**
  **POST** `/carts/{userId}`

- **Update Cart**
  **PUT** `/carts/{userId}`

- **Get Cart**
  **GET** `/carts/{userId}`

- **Delete Cart**
  **DELETE** `/carts/{userId}`

---

#### **PingController**

- **Health Check**
  **GET** `/ping`

---

#### **ProductController**

- **Count Products**
  **GET** `/products/count`

- **Get Product by ID**
  **GET** `/products/{id}`

- **Update Product**
  **PUT** `/products/{id}`

- **Partial Update Product**
  **PATCH** `/products/{id}`

- **Delete Product**
  **DELETE** `/products/{id}`

- **Create Product**
  **POST** `/products`

- **Bulk Update Products**
  **PATCH** `/products`

- **Get All Products**
  **GET** `/products`

---

#### **UserManagementController**

- **Forgot Password**
  **PUT** `/users/forgot-password`

- **User Login**
  **POST** `/users/login`

- **Get Current User Info**
  **GET** `/users/me`

- **Reset Password Completion**
  **PUT** `/users/reset-password/finish`

- **Reset Password Initialization**
  **POST** `/users/reset-password/init`

- **Get Recommendations for User**
  **GET** `/users/{userId}/recommend`

- **Update User by ID**
  **PUT** `/users/{userId}`

- **Get User by ID**
  **GET** `/users/{userId}`

- **Create User**
  **POST** `/users`

---

#### **UserOrderController**

- **Create Order for User**
  **POST** `/users/{userId}/orders`

- **Get User Orders**
  **GET** `/users/{userId}/orders`

- **Delete User Order**
  **DELETE** `/users/{userId}/orders`

---

### Notes

- Use the **Swagger UI** to test each endpoint, view request/response details, and understand the parameters and response structure.
- Make sure your application is running locally on **PORT 3000** for the Swagger documentation to be accessible.
- **URL**: [http://127.0.0.1:3000/explorer](http://127.0.0.1:3000/explorer)






# User Roles and Permissions

In the application, there are two major roles: **Admin** and **Customer**. Each role has specific permissions and capabilities.

## 1. Admin Role

The Admin has the authority to manage the product inventory. Below are the permissions assigned to the Admin role:

### Admin Permissions

- **Create Product**
  - **Endpoint**: `POST /products`
  - **Description**: Allows the Admin to add new products to the inventory.

- **Update Product**
  - **Endpoint**: `PUT /products/{id}`
  - **Description**: Allows the Admin to update details of an existing product.

- **Partial Update Product**
  - **Endpoint**: `PATCH /products/{id}`
  - **Description**: Allows the Admin to make partial updates to product details.

- **Delete Product**
  - **Endpoint**: `DELETE /products/{id}`
  - **Description**: Allows the Admin to remove a product from the inventory.

- **Get Product by ID**
  - **Endpoint**: `GET /products/{id}`
  - **Description**: Allows the Admin to retrieve details of a specific product.

- **Get All Products**
  - **Endpoint**: `GET /products`
  - **Description**: Allows the Admin to view all products in the inventory.

---

## 2. Customer Role

The Customer can interact with the shopping cart and process purchases. Below are the permissions assigned to the Customer role:

### Customer Permissions

- **Create Cart**
  - **Endpoint**: `POST /carts/{userId}`
  - **Description**: Allows the Customer to create a new shopping cart.

- **Add Item to Cart**
  - **Endpoint**: `POST /carts/{userId}/items`
  - **Description**: Allows the Customer to add products to their shopping cart.

- **Update Cart**
  - **Endpoint**: `PUT /carts/{userId}`
  - **Description**: Allows the Customer to update their shopping cart (e.g., change quantities).

- **Get Cart**
  - **Endpoint**: `GET /carts/{userId}`
  - **Description**: Allows the Customer to retrieve their shopping cart details.

- **Delete Cart**
  - **Endpoint**: `DELETE /carts/{userId}`
  - **Description**: Allows the Customer to remove their shopping cart.

- **Checkout**
  - **Endpoint**: `POST /users/{userId}/orders`
  - **Description**: Allows the Customer to process the checkout and place an order.

- **Get User Orders**
  - **Endpoint**: `GET /users/{userId}/orders`
  - **Description**: Allows the Customer to view their order history.

---

### Summary

- **Admin**: Responsible for managing products (create, update, delete, view).
- **Customer**: Responsible for managing carts and placing orders (create cart, add items, checkout).

This structure helps ensure that permissions are appropriately assigned based on user roles, maintaining a secure and efficient application.

### Notes

- Use the **Swagger UI** to test each endpoint, view request/response details, and understand the parameters and response structure.
- **URL**: [http://127.0.0.1:3000/explorer](http://127.0.0.1:3000/explorer)
