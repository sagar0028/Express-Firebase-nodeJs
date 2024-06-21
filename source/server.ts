import app from "./app";
import http from "http";
import {Express} from "express";
import * as dotenv from "dotenv";
dotenv.config();
import {errorHandler} from "./utils/helper/api-handler";
import pg from "./connection/postgres"
import admin from 'firebase-admin';

// import serviceAccount from "./config/firebase"


const router: Express = app;
const PORT = process.env.PORT || 8001


router.get("/", function (req, res) {
    res.status(200).send(`App listening on Port: ${PORT}`);
});
var serviceAccount = require("../../../Downloads/learning-14094-firebase-adminsdk-cr3yb-aafc09f4e4.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});






/** Error handling */
router.use(errorHandler);

/** Server */
const httpServer = http.createServer(router);
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`))