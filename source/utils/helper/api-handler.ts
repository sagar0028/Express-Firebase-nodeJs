import {IResponseData} from "../common-types";
import logger from "../logger";

export const failureResponse = (err: any): IResponseData => {
    logger.error(err);
    if (typeof err === "string") {
        return {
            statusCode: 400, responseBody: {message: err, errorCode: "CustomError"},
        };
    }
    let statusCode = 500;
    if (err.name == "ValidationError") statusCode = 400;
    return {
        statusCode: statusCode, responseBody: {message: err.message, errorCode: err.name},
    };
};

export const successResponse = (data: any): IResponseData => {
    return {statusCode: 200, responseBody: data};
};

export const errorHandler = (req: any, res: any, next: any) => {
    try {
        const error = new Error();
        error.name = "Not Found";
        error.message = "API Not Found";
        const _err = failureResponse(error);
        return res.status(404).json(_err.responseBody);
    } catch (error) {
        logger.error(error);
        return res.status(500).send("Internal Server Error");
    }
};
