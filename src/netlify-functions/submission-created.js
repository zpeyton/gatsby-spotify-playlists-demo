require('dotenv').config()
// const fetch = require('node-fetch')

exports.handler = async (event) => {
    console.log(event.body)
    let jsonData = JSON.parse(event.body) 
    if(jsonData.payload['form-name'] == 'contact'){
        const email = JSON.parse(event.body).payload.email
        console.log(`Recieved a submission: ${email}`)
    }

    console.log("End Form Submission")
    
    return true
}