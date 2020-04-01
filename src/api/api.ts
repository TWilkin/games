import bodyParser from 'body-parser';
import { Express, Response, Request } from 'express';
import HttpStatus from 'http-status-codes';
import { Model, ModelCtor } from 'sequelize';

import { sequelize } from '../db';

export default class API {

    private model: ModelCtor<Model<any, any>>;

    constructor(model: ModelCtor<Model<any, any>>) {
        this.model = model;
    }

    public get = (req: Request<any>, res: Response<any>): Promise<any> => {
        console.log(this.model);
        let data: any;
        if(req.param && req.params.id) {
            data = this.model.findByPk(req.params.id);
        } else {
            data = this.model.findAll();
        }

        return this.generateResponse(data, res);
    }

    public post = (req: Request<any>, res: Response<any>): Promise<any> => {
        let data = this.model.create(req.body);
        return this.generateResponse(data, res);
    }

    public put = (req: Request<any>, res: Response<any>): Promise<any> => {
        // create the query (assume no composite primary keys)
        const primaryKey = this.model.primaryKeyAttribute;
        const query: any = { where: { } };
        query.where[primaryKey] = req.params.id;

        let data = this.model.update(req.body, query);

        // send the response based on what (if anything) was updated
        if(data[0] == 0) {
            return this.generateResponse(undefined, res);
        }
        return this.generateResponse(undefined, res, HttpStatus.NO_CONTENT);
    }

    private async generateResponse(promise: Promise<any> | undefined, res: Response<any>, ifNull=HttpStatus.NOT_FOUND) {
        let data = await promise;
        if(!data || Object.keys(data).length == 0 ) {
            res.status(ifNull).send();
        } else {
            // check if we created a new record
            if(data.isNewRecord) {
                res.status(HttpStatus.CREATED);
            }
            res.json(data);
        }
    }

    public static init(app: Express, root: string) {
        app.use(bodyParser.json());
    
        // the base URLs for the API
        const baseURL = `${root}/api`.replace('//', '/');
    
        // create common endpoints for each model
        Object.values(sequelize.models).forEach((model) => {
            const url = `${baseURL}/${model.name.toLowerCase()}`;
            const instance = new API(model);
    
            // create the GET endpoint
            app.get(url, instance.get);
    
            // create the GET by id endpoint
            app.get(`${url}/:id`, instance.get);
    
            // create the POST endpoint
            app.post(url, instance.post);
    
            // create the PUT endpoint
            app.put(`${url}/:id`, instance.put);
        });
    }
}

