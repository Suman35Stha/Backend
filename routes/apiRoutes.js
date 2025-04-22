import { Router } from "express";

const routes =Router();

//get api for testing
routes.get('/', (req,res) => {
    res.json({
        message: "Hello Suman",
        time: new Date().toISOString()
    });
});

//set cookies for testing
routes.get('/set-cookie', (req, res) => {
    res.cookie('username', 'suman', {
        httpOnly: true,
        maxAge: 86400000 //1day
    });
    res.send("cookies set!");
});

//get cookies for testing
routes.get('/get-cookie', (req, res) => {
    const {username} = req.cookies;
    res.send(`cookies: ${username || 'not set'}`);
});

// export default routes;