require('dotenv').config()
// const fetch = require('node-fetch')
const { SENDGRID_API_KEY } = process.env


exports.handler = async function(event,context,callback) {
    
    //console.log(`Sendgrid API Key ${SENDGRID_API_KEY}`)
    console.log("v1")
    console.log(event.body)
    let jsonData = JSON.parse(event) 
    if(jsonData.payload['form-name'] == 'contact'){
        const email = JSON.parse(event.body).payload.email
        console.log(`Recieved a submission: ${email}`)
    }

    console.log("End Form Submission")
    
    return true
}