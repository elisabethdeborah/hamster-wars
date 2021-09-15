
const express = require('express')
const app = express()
const hamstersRouter = require('./routes/hamsters.js')


//konfigurera
const PORT = process.env.PORT || 1337

//middleware. //middleware ska alltid ha tre parametrar
//logger, bra att se alla requests
app.use( express.urlencoded( {extended: true}) ) //används vid autentisering/vill skicka formulär 
app.use ( express.json() )
/* app.use((req, res, next) => {
    console.log(`Method: ${req.method} Url: ${req.url}, Body: ${req.body}`);
    next()
}) */




//routes / endpoints
//hamstersrouter-middleware ska användas av alla routes som börjar med hamsters.
//app.use('/hamsters', hamstersRouter) 



//Starta servern

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
}) 