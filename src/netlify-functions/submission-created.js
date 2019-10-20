require('dotenv').config()
// const fetch = require('node-fetch')



exports.handler = async event => {
    const { SENDGRID_API_KEY } = process.env
    console.log(`Sendgrid API Key ${SENDGRID_API_KEY}`)
    console.log(event)
    let jsonData = JSON.parse(event) 
    if(jsonData.payload['form-name'] == 'contact'){
        const email = JSON.parse(event.body).payload.email
        console.log(`Recieved a submission: ${email}`)
    }

    console.log("End Form Submission")
    
    return true
}