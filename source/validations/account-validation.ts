import Joi from 'joi';
import {NextFunction, Request, Response} from 'express';

const accountSchema = Joi.object({
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().max(16).required(),
    password: Joi.string().min(6).max(50).required(),
    birthday: Joi.date().required(),
});

export const validateAccountCreation = (req: Request, res: Response, next: NextFunction) => {
    const {error} = accountSchema.validate(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }
    next();
};

