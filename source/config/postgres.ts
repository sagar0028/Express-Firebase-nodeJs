import dotenv from "dotenv";
dotenv.config();

export default {
    POSTGRESQL_URI: process.env.POSTGRESQL_URI
}
