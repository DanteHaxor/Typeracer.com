
# TypeBattle.com

TypeBattle is a multiplayer online browser-based typing game. In TypeBattle, players complete typing tests of various texts as fast as possible, competing against themselves or with other users online

## Features

- Authentication
- Authorization
- Responsive
- Cross platform


## Tech Stack

**Framework:** Vite

**Client:** HTML, CSS, JavaScript 

**Server:** Node.js, Express.js, Socket.io

**Database:** MongoDB, Redis

## Run Locally

Clone the project

```bash
  git clone https://github.com/faraz412/acceptable-straw-3421
```

Go to the project directory

```bash
  cd acceptable-straw-3421
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node index.js
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`key`

`mongourl`

`PORT`

### API base URL (local vs deployed)

Edit `urls.config.js` at the project root:

- `environment: "local"` — `http://localhost:1337` (use while testing)
- `environment: "deployed"` — `https://type-battle.onrender.com` (use before pushing)

All client API and Socket.io calls read from this file via `client/public/scripts/baseURL.js`.

## API Reference

#### Welcome

```http
  GET /api
```
#### User Register

```http
  POST /api/user/register
```
#### User Login

```http
  POST /api/user/login
```
#### Admin Register

```http
  POST /api/admin/register
```
#### Admin Login

```http
  POST /api/admin/login
```
#### All Content

```http
  GET /api/content/
```
#### Add Content

```http
  POST /api/content/addcontent
```
#### Update Content

```http
  PATCH /api/content/update/:id
```
#### Delete Content

```http
  DELETE /api/content/delete/:id
```

## Screenshots

![App Screenshot](https://i.imgur.com/LhQOBsU.jpeg)
![App Screenshot](https://i.imgur.com/PfAyWy4.jpeg)
![App Screenshot](https://i.imgur.com/loiArEj.jpeg)



## Demo
https://type-battle.onrender.com/
## Authors

- [@DanteHaxor](https://github.com/DanteHaxor)
- [@Abhinav068](https://github.com/Abhinav068)
- [@shanukajain](https://github.com/shanukajain)
- [@faraz412](https://github.com/faraz412)
- [@sarveshgupta1997](https://github.com/sarveshgupta1997)
