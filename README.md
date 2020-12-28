# Games

Video game collection browser and time logging service.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

The application consists of two services:

* The API backend which connects to the database behind GraphQL.
* The React UI frontend which allows easy use of the API for end-users.

To check-out and build the code on your development environment:
```bash
git clone https://github.com/TWilkin/games.git
cd games/api
npm install
cd ../ui
npm install
```

To run the API on your development environment using an SQLite database instance on port 3000:

```bash
cd games/api
npm run-script dev
```

To run the UI on your development environment connecting to the aforementioned running API instance, on port 8080:

```bash
cd games/ui
npm start
```

## Running the tests

### API

To run the API tests execute the following commands from your local check-out of the project:

```bash
cd games/api
npm test
```

This will produce an output containing the automated test results and the test code coverage.

### UI

There are currently no tests for the UI.

## Deployment
### Docker

The application supports deployment using Docker, and includes Dockerfiles for both services and a `docker-compose.yml` file. The database used when deploying with Docker is PostgreSQL to easily support deployment on ARM based Raspberry Pis.

```bash
git clone https://github.com/TWilkin/games.git
cd games
docker-compose build
docker-compose up
```

### Without Dokcer

The application can also be deployed without using Docker. Simply copy the API `src` directory into your web host's published node hosting directory. A configuration file will be needed containing the database configuration and credentials, see [default.json](https://github.com/TWilkin/games/blob/master/api/config/default.json) as an example.

The UI will need to be built first using webpack, which can be accomplished with the following commands:
```bash
cd games/ui
npm run-script build
```

This will create `bundle.js` in the `dist` directory, copy this with the contents of the `public` directory to your web host. This should give you a directory matching the following:

```
- bundle.js
- index.html
```

## Authors

* **Tom Wilkin** - Most of what you see - [TWilkin](https://github.com/TWilkin/)

See also the list of [contributors](https://github.com/TWilkin/games/contributors) who participated in this project.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details
