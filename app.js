const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let DB = null

const gettingConnectWithDB = async () => {
  try {
    DB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3002, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

gettingConnectWithDB()

const covertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// API 1: All Players Result
//-----------------------------

app.get('/players/', async (request, response) => {
  const allPlayersQuiry = `SELECT * 
  FROM cricket_team;`
  const allPlyersResult = await DB.all(allPlayersQuiry)
  response.send(allPlyersResult.map(i => covertDbObjectToResponseObject(i)))
})

//  API 2: Creating New Player
//------------------------------
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const insertQuiry = `INSERT INTO 
  cricket_team(player_name,jersey_number,role)
   VALUES(
         '${playerName}',
         ${jerseyNumber},
          '${role}');`
  const insert_result = await DB.run(insertQuiry)
  response.send('Player Added to Team')
})

// API 3:  Single Player Info
//------------------------------
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerQuiry = `SELECT *
   FROM cricket_team
    WHERE player_id = ${playerId};`

  const playerResult = await DB.get(playerQuiry)
  response.send(covertDbObjectToResponseObject(playerResult))
})

// API 4:  Updating Player Info
//--------------------------------

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updateQuiry = `UPDATE cricket_team
    SET
    player_name = "${playerName}",jersey_number =  ${jerseyNumber} ,role = "${role}"
    WHERE player_id = ${playerId};`

  await DB.run(updateQuiry)
  response.send('Player Details Updated')
})

// API 5: Deleting Player Info
//-------------------------------

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deleteQuiry = `DELETE
   FROM
    cricket_team
    WHERE 
        player_id = ${playerId};`
  await DB.run(deleteQuiry)
  response.send('Player Removed')
})

module.exports = app
