import {NextFunction, Request, Response} from 'express';
import admin from 'firebase-admin';



export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
        await admin.auth().verifyIdToken(token);
        next();
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};
