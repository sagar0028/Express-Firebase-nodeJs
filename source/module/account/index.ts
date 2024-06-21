import { log } from "console";
import pg from "../../connection/postgres";
import logger from "../../utils/logger";

class Account {

    createAccount = async (
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        password: string,
        birthday: string) => {
        try {
            const query = {
                text: `INSERT INTO public.accounts (first_name,last_name, email, phone, password, birthday,created_at, last_modified)
                       VALUES ($1, $2, $3, $4, $5, $6,now(),now());`,
                values: [first_name,last_name, email, phone, password, birthday]
            };
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
    getAccountByEmail =  async (email: string) => {
        try {
            const query = {
                text: `select * from public.accounts where email=${email}`
            };
            console.log(pg.query(query))
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    findByPk =  async (id: number) => {
        try {
            const query = {
                text: `select * from public.accounts where id=${id}`
            };
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

     updateAccount = async (
        id: string,
        first_name?: string,
        last_name?: string,
        email?: string,
        phone?: string,
        password?: string,
        birthday?: string
        ) => {
        try {
            const fieldsToUpdate = [];
            const values = [];
            let index = 1;
    
            if (first_name) {
                fieldsToUpdate.push(`first_name = $${index++}`);
                values.push(first_name);
            }
            if (last_name) {
                fieldsToUpdate.push(`last_name = $${index++}`);
                values.push(last_name);
            }
            if (email) {
                fieldsToUpdate.push(`email = $${index++}`);
                values.push(email);
            }
            if (phone) {
                fieldsToUpdate.push(`phone = $${index++}`);
                values.push(phone);
            }
            if (password) {
                fieldsToUpdate.push(`password = $${index++}`);
                values.push(password);
            }
            if (birthday) {
                fieldsToUpdate.push(`birthday = $${index++}`);
                values.push(birthday);
            }
    
            if (fieldsToUpdate.length === 0) {
                throw new Error("No fields provided for update.");
            }
    
            fieldsToUpdate.push(`last_modified = now()`);
    
            const queryText = `
                UPDATE public.accounts
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = $${index}
                RETURNING *;
            `;
            values.push(id);
    
            const { rowCount, rows } = await pg.query({
                text: queryText,
                values: values
            });
    
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    deleteByPk = async (id: number) => {
        try {
            const query = {
                text: 'DELETE FROM public.accounts WHERE id = $1 RETURNING *;',
                values: [id]
            };
            const { rowCount, rows } = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    getAllAccounts = async (limit: number | 10) => {
        try {
            const query = {
                text: `SELECT * FROM public.accounts LIMIT ${limit};`,
            };
            const { rowCount, rows } = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
}


export default new Account();