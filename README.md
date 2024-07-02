# Identity Reconciliation Service

This project is an implementation of an identity reconciliation service using Node.js, TypeScript, Express, and Prisma ORM. It consolidates customer contact information based on email and phone number.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository.

```bash
git clone https://github.com/anakinsonone/bitspeed-backend.git
```

2. Navigate to the project directory.

```bash
cd path/to/directory
```

3. Install all dependencies.

```bash
npm install
```

### Database Setup

This project uses SQLite as the database for simplicity and PrismaORM for database management.

1. Create `.env` file from the `.env.example` file provided and set the `DATABASE_URL` to

```bash
DATABASE_URL="file:./prisma/dev.db"
```

2. Run the following command to create and migrate the database schema.

```bash
npx prisma migrate dev --name init
```

### Running the server locally

To run the server in development mode

```bash
npm run dev
```

### Build the project

To compile the TypeScript code to JavaScript code

```bash
npm run build
```

### Running the Build

After building the project, you can start the server using:

```bash
npm run start
```

## Hosted Endpoint

The project is hosted on Render, and the exposed endpoint is available at:

```
https://bitespeed-backend-7je6.onrender.com/
```

### API Endpoint

Endpoint: `/identify`

Method: `POST`

Request Body

- `email`: A string representing the email of the customer.
- `phoneNumber`: A string representing the phone number of the customer.
