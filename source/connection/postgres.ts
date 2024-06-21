import { Pool ,types} from "pg";
import config from "../config/postgres"

interface IPgResult {
    rows: Array<any>;
    fields: Array<any>;
    command: string;
    rowCount: number;
}
types.setTypeParser(1114, function (value) {
    let temp=new Date(value)
    return new Date(Date.UTC(
        temp.getFullYear(), temp.getMonth(), temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds(), temp.getMilliseconds())
    );
})
class PostgreSQL {
    private pool: Pool;
    constructor(connectionString: any) {
        this.pool = new Pool({ connectionString });
    }
    query(query: any): IPgResult {
        return this.pool.query(query);
    }
}

export default new PostgreSQL(config.POSTGRESQL_URI);

