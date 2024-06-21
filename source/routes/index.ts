import {Express} from "express";
import AccountController from "../controller/accountController";

const apiV1 = `/api/v1/`;


export default (app: Express) => {

    app.use(`${apiV1}`, AccountController.router);

};

