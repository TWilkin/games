import dateformat from 'dateformat';
import { GraphQLScalarType, ValueNode, StringValueNode } from 'graphql';

const DateTimeScalarType = new GraphQLScalarType({
    name: 'DateTime',
    serialize: toISODateTime,
    parseValue: (value) => value,
    parseLiteral(ast: ValueNode) {
        return toISODateTime((ast as StringValueNode).value);
    }
});
export default DateTimeScalarType;

function toISODateTime(value: string | number) {
    return dateformat(value, 'isoUtcDateTime');
}
