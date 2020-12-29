import config from 'config';
import fs from 'fs';

// the interface for the Express configuration
interface ExpressConfiguration {
    root: string;
    port?: number;
}

// the interface for the Auth configuration
interface AuthConfiguration {
    secret: string;
    secureCookie: boolean;
}

export default class Configuration {

    public static get getDatabaseData(): string | null {
        return config.get('database.data');
    }

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
            return fs.readFileSync(config.get('database.password_file')).toString().trim();
        }

        // otherwise return it directly
        return config.get('database.password');
    }

    public static get getExpress(): ExpressConfiguration {
        return {
            root: config.get('express.root'),
            port: config.get('express.port') as number > 0 ? config.get('express.port') : undefined
        };
    }

    public static get getAuth(): AuthConfiguration {
        return {
            secret: config.get('auth.secret'),
            secureCookie: config.get('auth.secure_cookie')
        };
    }

}