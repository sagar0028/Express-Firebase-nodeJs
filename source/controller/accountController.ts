import account from '../module/account/index';
import bcrypt from 'bcryptjs';
import {Request, Response, Router} from "express";
import {validateAccountCreation} from "../validations/account-validation";
import {authMiddleware} from "../connection/firebase";
import admin from "firebase-admin";
import moment from "moment";
import emailService from '../services/emailService';

class AccountController {
    router = Router();

    constructor() {
        this.intializeRoutes();
    }

    private intializeRoutes() {
        this.router.post("/accounts", validateAccountCreation, this.createAccount);
        this.router.post("/account/login",this.login)
        this.router.get("/accounts/:id",authMiddleware, this.getAccount);
        this.router.put("/accounts/:id",authMiddleware, validateAccountCreation,this.updateAccount);
        this.router.delete("/accounts/:id",authMiddleware, this.deleteAccount);
        this.router.get("/accounts",authMiddleware, this.listAccounts);
    }


    //     try {
    //         const {
    //             first_name,
    //             last_name,
    //             email,
    //             phone,
    //             password,
    //             birthday
    //         } = req.body;
    //         const hashedPassword = await bcrypt.hash(password, 10);
    //         const account = await Account.create({
    //             first_name,
    //             last_name,
    //             email,
    //             phone,
    //             password: hashedPassword,
    //             birthday,
    //             created_at: new Date(),
    //             last_modified: new Date(),
    //         });
    //         // emailService.sendAccountCreationEmail(email);
    //         res.status(201).json(account);
    //     } catch (error) {
    //         res.status(500).json(error);
    //     }
    // };
    private createAccount = async (req: Request, res: Response) => {
        try {
            const { first_name, last_name, email, phone, password, birthday } = req.body;
            const hashedPassword: string = await bcrypt.hash(password, 10);

            const _result = await account.createAccount(
                first_name,
                last_name,
                email,
                phone,
                hashedPassword,
                birthday)

            if ( _result.rowCount > 0) {
            const customToken = await admin.auth().createCustomToken(email);
            
            await admin.auth().setCustomUserClaims(email, { role: 'user' });
            
            const expiresIn = 60 * 60 * 24; // 1 day in seconds
            
            await admin.auth().createUser({
                uid: email,
                email: email,
                password: password,
                displayName: `${first_name} ${last_name}`,
                phoneNumber: phone,
            });

            const firestore = admin.firestore();
            await firestore.collection('users').doc(email).set({
                customToken,
                expiresIn,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            emailService.sendAccountCreationEmail(email);

            res.status(201).json({message: "Your account has been successfully created", customToken });
            }
             else {
                res.status(500).json({message:"Something Went Wrong"})
            }
            
        } catch (error) {
            res.status(500).json(error );
        }
    };

    private login =  async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const _result = await account.getAccountByEmail(email);
            if ( _result.rowCount > 0){
                const { password: dbPass }  = _result.rows[0];
                const isPasswordValid = await bcrypt.compare(password, dbPass);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: "Authentication failed. Wrong password." });
                }

             let firebaseUser = await admin.auth().getUserByEmail(email);

             if(!firebaseUser){
                return res.status(401).json({ message: "Authentication failed. User not found in Firebase." });
             }

             const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

             res.status(200).json({ message: "Login successful", customToken });
     

            } else {
                return res.status(401).json({ message: "Authentication failed. User not found." });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    }
    private getAccount = async (req: Request, res: Response) => {
        try {
            let id = req?.params?.id
            const _result = await account.findByPk(parseInt(id));
            if (_result.rowCount > 0) {
                res.status(200).json(_result.rows);
            } else {
                res.status(500).json({error: 'Account not found'});
            }
        } catch (error) {
            res.status(400).json(error);
        }
    };
    
    private updateAccount = async (req: Request, res: Response) => {
        try {
            const {
                id,
                first_name,
                last_name,
                email,
                phone,
                password,
                birthday} = req.body;

               
            const _account = await account.findByPk(parseInt(id));

                if(_account.rows.length === 0){
                    res.status(404).json({error: 'Account not found'});
                }
            
            const _result = await account.updateAccount(
                id,
                first_name,
                last_name,
                email,
                phone,
                password,
                birthday);
            
            if(_result.rowCount > 0){
                const userRecord = await admin.auth().getUserByEmail(email);

                const uid = userRecord.uid;

                const updatedUser = await admin.auth().updateUser(uid, {
                    email: email,
                    password: password,
                    displayName: `${first_name} ${last_name}`,
                    phoneNumber: phone
                });

                if(updatedUser){
                  return res.status(200).json({ message: " Record Update successful" });
                }
            }           
        } catch (error) {
            res.status(500).json(error);
        }
    };
    
    private deleteAccount = async (req: Request, res: Response) => {
        try {
            const id  = req?.params?.id
            const deleted = await account.deleteByPk(parseInt(id))
            if (deleted) {
                res.status(202).send({ message: " Record successful"});
            } else {
                res.status(404).json({error: 'Account not found'});
            }
        } catch (error) {
            res.status(500).json(error);
        }
    };
    
    private listAccounts = async (req: Request, res: Response) => {
        const limitStr = req?.query?.limit;
        let limit = parseInt(limitStr as any) ;        try {
            const accounts = await account.getAllAccounts(limit );
            res.status(200).json(accounts);
        } catch (error) {
            res.status(500).json(error);
        }
    };
}

export default new AccountController()