

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const MATCHES = 'matches'
const HAMSTERS = 'hamsters'

//GET /matchWinners/:id
// Array med matchobjekt för alla matcher, som hamstern med id har vunnit. 
//Statuskod 404 om id inte matchar en hamster som vunnit någon match. 




router.get('/:id', async(req, res) => { 
    let hasWonMatches = await getWinnersMatches(req.params.id)
    console.log(req.params.id);
    if (hasWonMatches) {
        res.send(hasWonMatches) 
    } else {
        res.sendStatus(404)
    }
    //res.send(array)
})

//HÄMTA HAMSTER-OBJ. 
//KOLLA ATT HAMSTER.WINS ÄR > 0 
//OM WINS < 1 RETURNERA 404
//ANNARS:
//HÄMTA ALLA MATCHER
//LOOPA IGENOM MATCHERNAS WINNER-ID:S OCH
//MATCHA WINNER-ID:S MED HAMSTER-ID
//PUSHA VUNNA MATCHER TILL ARRAY

//GET
/* const getAllMatches = async() => {
    const docRef = db.collection(HAMSTERS).doc(id)
    const docSnapshot = await docRef.get()
    if( docSnapshot.exists ) {
        return await docSnapshot.data()
    } 
	
} */




const getWinnersMatches = async(id) => {

    let allMatchesArray = []
    //all matches
    const matchesRef = db.collection(MATCHES)
    const hamserRef = db.collection(HAMSTERS).doc(id)
    const matchesSnapshot = await matchesRef.get()
	if( matchesSnapshot.empty ) {
		return false
	}
    const hamsterSnapshot = await hamserRef.get()
	if( hamsterSnapshot.empty ) {
		return false
	}
    
    //find matches from spec hamster
    await matchesSnapshot.forEach(async docRef => {
		const data = await docRef.data()
        if (data.winnerId === hamsterSnapshot.id) {
          //  console.log('yes: ', data);
             allMatchesArray.push(data)
        }/* 
        console.log('allMatchesArray inside: ',  allMatchesArray);
        return allMatchesArray */
	})
   // console.log('allMatchesArray: outside ',  allMatchesArray);
    if ( allMatchesArray.length > 0 ) {
        return allMatchesArray
    } else {
        return false
    }
}


module.exports = router