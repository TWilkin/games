import config from 'config';
import fs from 'fs';

export default class Configuration {

    public static get getDatabaseURI(): string {
        const dialect = config.get('database.dialect');
        if(dialect == 'sqlite') {
            return 'sqlite://:memory:';
        }

        const user = config.get('database.user');
        const password = Configuration.getDatabasePassword();
        const host = config.get('database.host');
        const port = config.get('database.port');
        const schema = config.get('database.schema');
        return `${dialect}://${user}:${password}@${host}:${port}/${schema}`;
    }

    private static getDatabasePassword(): string {
        // check if it's in a file (e.g. docker)
        if(config.get('database.password_file')) {
            return fs.readFileSync(config.get('database.password_file')).toString();
        }

        // otherwise return it directly
        return config.get('database.password');
    }

}