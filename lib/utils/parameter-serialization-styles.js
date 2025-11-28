import { objectExpression, objectProperty } from '@babel/types';
import { objectPropertyKey, valueToAstExpression } from '../schema-to-typescript/common';
const defaultParameterStyles = {
    query: 'form',
    cookie: 'form',
    header: 'simple',
    path: 'simple'
};
const defaultParameterExplode = {
    form: true,
    spaceDelimited: false,
    pipeDelimited: false,
    deepObject: true,
    simple: false,
    label: false,
    matrix: false
};
function getParameterSerializeInfo(parameter) {
    const { style = defaultParameterStyles[parameter.in], explode = defaultParameterExplode[style] } = parameter;
    if (style !== defaultParameterStyles[parameter.in]) {
        if (explode !== defaultParameterExplode[style]) {
            return { style, explode };
        }
        return { style };
    }
    if (explode !== defaultParameterExplode[style]) {
        return { explode };
    }
    return null;
}
export function buildParametersSerializationInfo(parameters) {
    const parameterInfoByLocation = parameters.reduce((acc, parameter) => {
        const serializeInfo = getParameterSerializeInfo(parameter);
        if (!serializeInfo) {
            return acc;
        }
        let paramsInLocation = acc[parameter.in];
        if (!paramsInLocation) {
            paramsInLocation = acc[parameter.in] = [];
        }
        paramsInLocation.push({ name: parameter.name, info: serializeInfo });
        return acc;
    }, {});
    if (Object.keys(parameterInfoByLocation).length === 0) {
        return null;
    }
    return objectExpression(Object.entries(parameterInfoByLocation).map(([location, parameters]) => objectProperty(objectPropertyKey(location), objectExpression(parameters.map(({ name, info }) => objectProperty(objectPropertyKey(name), valueToAstExpression(info)))))));
}
