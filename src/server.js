
const express = require('express')
const app = express()
const hamstersRouter = require('./routes/hamsters.js')
const cutestRouter = require('./routes/cutest.js')
const path = require('path')

//konfigurera
const PORT = process.env.PORT || 1337

//middleware
app.use( express.urlencoded( {extended: true}) ) 
app.use ( express.json() )


//logger-middleware
app.use((req, res, next) => {
    console.log(`Method: ${req.method}, Url: ${req.url}, Body: ${req.body},  Params: ${req.params}`);
    next()
})

//serva statiska filer



//routes / endpoints

app.use('/hamsters', hamstersRouter) 

//CUTEST
app.use('/cutest', cutestRouter) 

//Starta servern

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
}) 