require('dotenv').config()
// const fetch = require('node-fetch')
const { SENDGRID_API_KEY } = process.env


exports.handler = function(event,context,callback) {
    
    //console.log(`Sendgrid API Key ${SENDGRID_API_KEY}`)
    console.log("v3")
    
    //console.log(event.body)
    let jsonData = JSON.parse(event.body)
    console.log(jsonData.email) 
    
    if(jsonData.payload['form-name'] == 'contact'){
        const email = jsonData.payload.email
        console.log(`Recieved a submission: ${email}`)
    }

    console.log("End Form Submission")
    
    return true
}