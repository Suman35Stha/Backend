import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.RESEND_API_KEY) { //if the resend api key is not provided   
    throw new Error("RESEND_API_KEY is expired"); //throw an error
}
const resend = new Resend(process.env.RESEND_API_KEY); //create a new resend instance

const sendEmail = async ({to, subject, html}) => {
    try {
        if (!to || typeof to !== 'string') {
            throw new Error('Email recipient must be a valid string'); //throw an error
        }

        const { data, error } = await resend.emails.send({ //send the email
            from: 'Blinkit <onboarding@resend.dev>', //from email
            to: to, //to email
            subject: subject, //subject
            html: html, //html
        });

        if (error) {
            console.error('Email sending error:', error); //if the email sending failed
            return { success: false, error }; //return the error
        }

        return { success: true, data }; //return the data
    } catch (error) {
        console.error('Email sending error:', error); //if the email sending failed
        return { success: false, error }; //return the error
    }
}

export default sendEmail;
