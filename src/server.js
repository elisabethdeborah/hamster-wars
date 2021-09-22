
const express = require('express')
var cors = require('cors')
const app = express()
const hamstersRouter = require('./routes/hamsters.js')
const matchesRouter = require('./routes/matches.js')
const matchWinnersRouter = require('./routes/matchWinners.js')
const winnersRouter = require('./routes/winners.js')
const losersRouter = require('./routes/losers.js') 
const fewMatchesRouter = require('./routes/fewMatches')
const manyMatchesRouter = require('./routes/manyMatches')


//konfigurera
const PORT = process.env.PORT || 1337

//middleware
app.use( express.urlencoded( {extended: true}) ) 
app.use ( express.json() )
app.use(cors())


//serva statiska filer

app.use('/img', express.static(__dirname+'/hamsters')) 
 app.use('/', express.static(__dirname+'/../public')) 


//routes / endpoints
//HAMSTERS
app.use('/hamsters', hamstersRouter) 

//MATCHES
app.use('/matches', matchesRouter)
app.use('/matchWinners', matchWinnersRouter)

//WINNERS
app.use('/winners', winnersRouter)

//LOSERS
app.use('/losers', losersRouter)

//MOST GAMES
app.use('/manyMatches', manyMatchesRouter)

//FEWEST GAMES
app.use('/fewMatches', fewMatchesRouter)


//Starta servern

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
}) 