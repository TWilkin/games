import { expect } from 'chai';
import { GraphQLSchema, GraphQLObjectType, isScalarType, isNonNullType, isListType, assertNonNullType, assertListType, ExecutionResult } from 'graphql';
import { ExecutionResultDataDefault } from 'graphql/execution/execute';
import { Model, ModelCtor } from 'sequelize';

export function generateQuery(schema: GraphQLSchema, typeName: string, params: any=null): string {
    // find the query from the schema
    const type = schema.getType(typeName) as GraphQLObjectType;

    // extract the schema type fields
    const fields: string[] = Object.values(type.getFields())
        .map(field => {
            let fieldType = field.type;

            // unpack non-null and list types
            if(isNonNullType(fieldType)) {
                fieldType = assertNonNullType(fieldType).ofType;
            }
            if(isListType(fieldType)) {
                fieldType = assertListType(fieldType).ofType;
            }

            // if it's a nested element add the sub-fields
            if(!isScalarType(fieldType)) {
                return `${field.name} { createdAt, updatedAt }`;
            }

            return field.name;
        });

    // add any query parameters if they are set
    let queryParams = '';
    let assign = '';
    if(params) {
        queryParams = `(${Object.keys(params).map(key => `$${key}: ${params[key].name}`).join(', ')})`;
        assign = `(${Object.keys(params).map(param => `${param}: $${param}`).join(', ')})`;
    }

    return `query${queryParams} { Get${typeName}${assign} { ${fields.join(', ')} } }`;
}

export function generateMutation(model: ModelCtor<Model<any, any>>, isAdd: boolean): string {
    const method = isAdd ? 'Add' : 'Update';
    const idParams = isAdd ? '' : '$id: Int!,';
    const idAssign = isAdd ? '' : 'id: $id,';
    
    return `mutation(${idParams} $input: ${model.name}Input!) {
        ${method}${model.name}(${idAssign} input: $input) {
            ${model.primaryKeyAttribute},
            createdAt,
            updatedAt 
        }
    }`;
}

function checkResponse(response: ExecutionResult<ExecutionResultDataDefault>, queryName: string) {
    expect(response).to.be.not.null;

    expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;

    expect(response.data).to.be.not.null;
    return expect(response.data).to.have.key(queryName);
}

export function checkQueryResponse(response: ExecutionResult<ExecutionResultDataDefault>, queryName: string, length: number) {
    return checkResponse(response, queryName)
        .which.is.not.null
        .and.length.is.equal(length);
}

export function checkMutationResponse(response: ExecutionResult<ExecutionResultDataDefault>, mutationName: string, model: ModelCtor<Model<any, any>>) {
    return checkResponse(response, mutationName)
        .which.is.not.null
        .and.is.not.an('array')
        .which.has.key(model.primaryKeyAttribute)
        .which.is.a('number');
}
