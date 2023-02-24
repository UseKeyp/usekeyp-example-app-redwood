<h1 align="center"><img width="600" style="border-radius: 30px;" src="https://raw.githubusercontent.com/UseKeyp/.github/main/Keyp-Logo-Color.svg"/></h1>
<h1 align="center">Welcome to Keyp Example App Redwood 👋</h1>
<p align="center">
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </a>
  <a href="https://twitter.com/UseKeyp" target="_blank">
    <img alt="Twitter: UseKeyp" src="https://img.shields.io/twitter/follow/UseKeyp.svg?style=social" />
  </a>
</p>

> Login, view tokens, and make transfers using the Keyp API

## Usage 📖

1. Install

```bash
 yarn
```

2. Create a `.env` file at the root of the repository and fill it out using the `.env.example` file as a guide.

3. Generate the sqlite database with the following script; this will create a `dev.db` file in the `api/db` directory.
   You can choose any name for the migration.

(Optional: with the sqlite database, you don't have to create a database in your local environment.
However, if you'd like to use PostgreSQL, you can change `migration_lock.toml`, `schema.prisma`, and your .env file
according to the documentation for
Prisma's [PostgreSQL connector](https://www.prisma.io/docs/concepts/database-connectors/postgresql))

```bash
 yarn redwood migrate dev
```

4. Start the development server

```bash
 yarn redwood dev
```

## Resources 🧑‍💻

## License 📝

Copyright © 2023 Nifty Chess, Inc.<br />
This project is MIT licensed.

[sponsor-keyp]: https://UseKeyp.com
