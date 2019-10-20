require('dotenv').config()
// const fetch = require('node-fetch')
const sendgrid = require('@sendgrid/mail')

const { SENDGRID_API_KEY } = process.env

sendgrid.setApiKey(SENDGRID_API_KEY);

exports.handler = function(event,context,callback) {
    
    //console.log(`Sendgrid API Key ${SENDGRID_API_KEY}`)
    console.log("v15")

    let jsonData = JSON.parse(event.body)
    let request = jsonData.payload
    
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
        sendgrid.send(mailParams)

        mailParams2 = {
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