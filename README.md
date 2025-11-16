# BeatFlow – Multi-Style Dance Guidance Platform

BeatFlow is a simple web-based application that allows users to *choose any song and view multiple dance styles* for that same song.

## Features
- Select a song
- Select a dance style (Hip-Hop, Samba )
- View steps/animations based on chosen style
- Backend APIs for songs and dance-style selection
- Frontend built using Vite + TypeScript + Tailwind
- Node.js + Express backend
- MongoDB database

## Project Structure
beatflow_project/
│── Backend_project/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── beat/
│   ├── index.html
│   ├── src/
│   ├── package.json
│   └── tailwind.config.ts
│
├── README.md

## Tech Stack
### Frontend
- Vite
- TypeScript
- HTML, CSS, Tailwind

### Backend
- Node.js
- Express.js
- MongoDB

## How to Run the Project

### Backend Setup
cd Backend_project
npm install

Create .env:

MONGO_URI=mongodb+srv://cs24b024_db:beatflow@beatflow.t98d500.mongodb.net/beatflow?retryWrites=true&w=majority
PORT=5000


Run:
npm start

### Frontend Setup
cd beat
npm install
npm run dev

## API Endpoints

### Songs
POST /uploadSong – Upload a song  
GET /songs – Get all songs  

### Dance Styles
GET /styles – Get dance styles  
POST /selectStyle – Select a dance style  

## Use Case Flow
1. User selects song  
2. System shows “Select Dance Style”  
3. User picks style  
4. System shows dance steps/animation  

## Problem Statement
Users cannot view *different dance styles for the same song*.  
BeatFlow solves this by giving:
- Multiple styles per song
- Simple but professional UI
- Users can learn more about cultural aspects by taking our quiz
- They can create their own music using the music composer

## Future Enhancements
- Add login & user playlists
- Add more styles

## Contributors
- Meda Tharsha sri
- T Vaishnavi
- S Vaishnavi Sree
- B Nandini
- M Varshini
