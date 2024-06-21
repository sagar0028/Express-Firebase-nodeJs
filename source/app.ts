import express, {Express} from "express";
import cors from "cors";
import loadRoutes from "./routes/index"

class App {
    public app: Express;

    constructor() {
        this.app = express();
        this.config();
    }

    private config() {
        this.app.use(express.json());

        /** Parse the request */
        this.app.use(express.urlencoded({extended: true, limit: "1mb"}));
        /** Takes care of JSON data */
        this.app.use(express.json({limit: "1mb"}));

        /** RULES OF OUR API */

        const corsOptions = {
            origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE", preflightContinue: true, optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        };

        this.app.use(cors(corsOptions));

        /** Load routes */
        loadRoutes(this.app);

    }
}
export default new App().app;
