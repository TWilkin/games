import { GraphQLSchema, GraphQLObjectType, isScalarType, isNonNullType, isListType, assertNonNullType, assertListType } from 'graphql';
import { Model, ModelCtor } from 'sequelize';

export function generateQuery(schema: GraphQLSchema, typeName: string, params: unknown=null): string {
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
