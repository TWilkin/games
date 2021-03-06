import config from 'config';
import fs from 'fs';
import path from 'path';

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

// OAuth service credentials
interface OAuthCredentials {
    id: string;
    secret: string;
}

export default class Configuration {

    public static get getCacheDirectory(): string {
        return path.join(__dirname, 'cache');
    }

    public static get getDatabaseData(): string | null {
        return config.get('database.data');
    }

    public static get getDatabaseURI(): string {
        const dialect = config.get('database.dialect');
        if(dialect == 'sqlite') {
            return 'sqlite://:memory:';
        }

        const user = config.get('database.user');
        const password = Configuration.getKeyOrFile('database.password');
        const host = config.get('database.host');
        const port = config.get('database.port');
        const schema = config.get('database.schema');
        return `${dialect}://${user}:${password}@${host}:${port}/${schema}`;
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

    public static get getIGDBClientCredentials(): OAuthCredentials {
        return {
            id: config.get('igdb.id'),
            secret: Configuration.getKeyOrFile('igdb.secret')
        };
    }

    public static get getUserAgent(): string {
        return `games/${process.env.npm_package_version}`;
    }

    private static getKeyOrFile(keyBase: string): string {
        // check if it's in a file (e.g. docker)
        const passwordKey = `${keyBase}_file`;
        if(config.has(passwordKey)) {
            return fs.readFileSync(config.get(passwordKey)).toString().trim();
        }

        // otherwise return it directly
        return config.get(keyBase);
    }
}
