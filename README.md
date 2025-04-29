# Hono Backend Boilerplate

This boilerplate provides a modern, scalable starting point for building backend applications using [Hono](https://hono.dev/) with strong developer tooling and best practices in place.

## Features

- **Hono**: Fast, lightweight web framework for building backend APIs  
- **Vite**: Fast development and build tooling, configured for backend use  
- **ESLint & Prettier**: Code linting and consistent formatting  
- **Zod**: Type-safe schema validation  
- **Dotenv**: Environment variable management  
- **Vitest**: Unit testing framework with fast test execution  
- **CommitLint & Husky**: Enforces conventional commit messages via pre-commit and commit-msg hooks  
- **Pnpm**: Fast and efficient package manager  

## Notes

This boilerplate is intentionally designed to be minimal, allowing flexibility for a wide range of backend architectures and project needs. It serves as a foundation rather than a full-stack solution.

You are free to extend it in any direction, including:

- **API Design**: RESTful, GraphQL, RPC, or hybrid styles
- **Rendering Strategy**: Compatible with both Client-Side Rendering (CSR) and Server-Side Rendering (SSR)
- **Database Integration**: Works with SQL/ORMs, NoSQL, or Backend-as-a-Service (BaaS) providers
- **Authentication**: Custom middleware can support session, JWT, OAuth, or third-party auth services

The goal is to provide a clean starting point that you can shape to fit your exact technical requirements and team preferences.

## Installation

To get started with this boilerplate, follow these steps:

### 1. Clone the Repository

git clone https://github.com/your-org/hono-backend-boilerplate.git your-project
cd your-project


### 2. Install Dependencies

This project uses `pnpm` as the package manager. Ensure you have `pnpm` installed, then install the project dependencies:


### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the template below:


Then, configure the values in your `.env` file. Here's a template:

#### `.env` Template

```env
# Server Port
PORT=3000

# Environment Stage (development, production, etc.)
STAGE=development

# Database URL (e.g., for PostgreSQL, MongoDB, etc.)
DATABASE_URL=your_database_url_here

# API keys or secrets (if applicable)
API_KEY=your_api_key_here

# Other environment-specific configurations can go here

```
### 4. Start the Development Server

pnpm dev

## Project Structure

- `src/`
  - `app/` — App initialization, server config, environment setup
  - `routes/` — Route definitions
  - `controllers/` — Request handlers
  - `services/` — Business logic layer
  - `repositories/` — Database interaction
  - `middlewares/` — Custom middleware (e.g., authentication, error handling)
  - `models/` — Validation schemas or ORM models
  - `types/` — Global TypeScript types
  - `utils/` — Helpers and utility functions
- `tests/` — Unit tests
- `.env` — Environment variables file
- `.eslintrc.mjs` — ESLint configuration
- `.prettierrc` — Prettier configuration
- `.gitignore`
- `commitlint.config.js` — CommitLint rules
- `husky/` — Git hook scripts
- `tsconfig.json` — TypeScript configuration
- `vite.config.ts` — Vite configuration for backend
- `package.json`
- `README.md`


## Recommended Development Practices
- Use environment-based configs to manage differences between dev, test, and production.

- Keep business logic in services/ and keep controllers focused on request handling.

- Use Zod for all input validation.

- Write unit tests alongside your modules.

- Maintain strict commit conventions using pnpm commit or by formatting manually.

## Tooling and Configuration

### ESLint & Prettier
Ensures consistent code style and formatting. Configured to work together without conflict.

### Husky & CommitLint
Husky sets up Git hooks to automate checks:

- **pre-commit**: Runs lint and formatting checks
- **commit-msg**: Validates commit messages

Enforces the [Conventional Commits](https://www.conventionalcommits.org/) standard to ensure clean and descriptive version history.

### Zod
Provides runtime validation for request bodies, parameters, and environment variables. Fully typed and integrated with TypeScript for safe, predictable data handling.

### Vitest
A fast and modern testing framework that supports mocking, snapshot testing, and code coverage out of the box. Ideal for unit testing and TDD workflows.

## Casing Conventions

To maintain consistency across the codebase, use the following naming conventions:

- **Camel Case** (`camelCase`): For variables, function names, and method names.  
  Example: `myVariable`, `getUserData()`

- **Pascal Case** (`PascalCase`): For classes, interfaces, and type aliases.  
  Example: `UserService`, `IUser`

- **Kebab Case** (`kebab-case`): For file and folder names, and API routes.  
  Example: `product-controller`, `/api/products`

- **Snake Case** (`snake_case`): For environment variables and constants.  
  Example: `DATABASE_URL`, `MAX_RETRIES`

- **Upper Case** (`UPPERCASE`): For configuration values and constants.  
  Example: `JWT_SECRET`, `MAX_CONNECTIONS`


### Author

Developed by `Joe Kier Hagos`.
