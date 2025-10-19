
# MongoDB Setup for Nebula Application

This guide will help you set up MongoDB for the Nebula application.

## Prerequisites

1. [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a MongoDB Atlas account
2. Node.js and npm installed

## Local MongoDB Setup

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service on your local machine
3. MongoDB will be available at `mongodb://localhost:27017` by default

## MongoDB Atlas Setup (Cloud)

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient for development)
3. In the Security tab, create a database user with read/write privileges
4. In Network Access, add your IP address or allow access from anywhere (for development)
5. In the Clusters view, click "Connect" and select "Connect your application"
6. Copy the connection string provided

## Configuring the Application

1. Create a `.env` file in the root of your project with the following content:

```
MONGODB_URI=your_mongodb_connection_string
```

2. Replace `your_mongodb_connection_string` with:
   - For local MongoDB: `mongodb://localhost:27017/nebula`
   - For MongoDB Atlas: The connection string provided by Atlas (replace `<password>` with your database user's password)

## Deploying to Production

When deploying to production:

1. Make sure your MongoDB instance is properly secured
2. Set the `MONGODB_URI` environment variable in your hosting provider's environment configuration
3. Ensure your application has network access to your MongoDB instance

## Data Model

The application uses the following collections:

- `users`: Stores user profiles and authentication information
- `tasks`: Stores all task data
- `queries`: Stores user queries and messages

These collections are automatically created when the application first interacts with them.

## Migrating from localStorage

The application currently uses localStorage, and data will be synced to MongoDB automatically on first setup. No manual migration is needed.
