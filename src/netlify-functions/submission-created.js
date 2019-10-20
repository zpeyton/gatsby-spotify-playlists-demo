require('dotenv').config()
// const fetch = require('node-fetch')
const { SENDGRID_API_KEY } = process.env


exports.handler = function(event,context,callback) {
    
    //console.log(`Sendgrid API Key ${SENDGRID_API_KEY}`)
    console.log("v5")

    let jsonData = JSON.parse(event.body)
    let request = jsonData.data
    
    if(request['form-name'] == 'contact'){
        const email = request.email
        console.log(`Recieved a submission: ${email}`)
    }

    console.log("End Form Submission")
    
    return true
}