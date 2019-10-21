require('dotenv').config()
// const fetch = require('node-fetch')
const sendgrid = require('@sendgrid/mail')

const { SENDGRID_API_KEY } = process.env

sendgrid.setApiKey(SENDGRID_API_KEY);

exports.handler = function(event,context,callback) {
    
    console.log("v18")

    //console.log(`SENDGRID_API_KEY ${SENDGRID_API_KEY}`)

    let jsonData = JSON.parse(event.body)
    
    let request = jsonData.payload
    
    //console.log(request)

    if(request.form_name == 'contact'){
        
        const { name, email } = request
        const { phone, message } = request.data
        
        let mailParams = {
            to: 'zachary.peyton@gmail.com',
            from: 'Web form <admin@quizmaniapp.com>',
            replyTo: `${name} <${email}>`,
            subject: 'New Message',
            text: `Name: ${name}\n\nEmail: ${email}\n\nPhone: ${phone}\n\nMessage:\n\n${message}`
        }
        //console.log(mailParams)
        sendgrid.send(mailParams)

        let mailParams2 = {
            to: email,
            from: 'Netlify Contact Demo <no-reply@blah.com>',
            subject: 'Thank you for your message!',
            text: `We got your message below and will reply as soon as we can.\n\n--------------\n\nName: ${name}\n\nEmail: ${email}\n\nPhone: ${phone}\n\nMessage:\n\n${message}`
        }

        sendgrid.send(mailParams2)
    }

    console.log("End Form Submission")
    
    return true
}