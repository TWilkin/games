class IGDBRequestFilter {
    field!: string;
    value!: string | number;
    operator!: 'like' | 'equal' | 'not equal'
};

type IGDBRequestParameter = {
    [key in 'limit' | 'where' | 'fields']: any;
};

export default class IGDBRequestBuilder {
    private query: IGDBRequestParameter;

    constructor(private func: (body: string) => Promise<any>) {
        this.query = {} as IGDBRequestParameter;
        this.limit(20).fields('*');
    }

    limit(n: number) {
        this.query['limit'] = n;
        return this;
    }

    fields(...fields: string[]) {
        this.query['fields'] = fields.join(',');
        return this;
    }

    equal = (field: string, value: string | number) => this.where(field, value, 'equal');

    like = (field: string, value: string) => this.where(field, value, 'like');

    where(field: string, value: string | number, operator: string) {
        if(!this.query['where']) {
            this.query['where'] = new Array<IGDBRequestFilter>();
        }
        let where = this.query['where'];

        where.push({ field, value, operator });

        return this;
    }

    fetch() {
        let body = Object.keys(this.query)
            .filter(key => key != 'where')
            .map(key => `${key} ${this.query[key]};`)
            .join(' ');

        if(this.query['where']) {
            body += ` where ${this.query['where']
                .map((filter: IGDBRequestFilter) => {
                    let value = typeof filter.value === 'number' ? `${filter.value}` : `"${filter.value}"`;

                    switch (filter.operator) {
                        case 'like': return `${filter.field} ~ *"${filter.value}"*`;
                        case 'equal': return `${filter.field} = ${value}`;
                        case 'not equal': return `${filter.field} != ${value}`
                    }
                })
                .join(' | ')
            };`
        }

        return this.func(body);
    }
}
