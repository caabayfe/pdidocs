/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        partial,
        value
    } = event.payload;
    const {
        cbTableName,
        queryValidation,
        validQuery
    } = api.state;

    let hasOr, unsupportedOperator;

    if (!cbTableName || !value) {
        return; 
    }

    // if was explictly set to null, means form was reset so reset validQuery to default empty string
    if (validQuery == null) {
        api.setState('validQuery', '');
        return;
    }

    if (value && value.length) {
        let queryParts = value.split('^');
        queryParts.forEach((part) => {
            const startsWith = part.substring(0, 2);
            if (startsWith == 'OR') {
                hasOr = true;
                part = part.substring(2);
            }
            let result = part.split(/(=|!=|<|>|<=|>=|ANYTHING|IN|STARTSWITH|ENDSWITH|NOT LIKE|ISEMPTY|ISNOTEMPTY|LIKE|SAMEAS|NSAMEAS|EMPTYSTRING|DYNAMIC|ON|NOTON|BETWEEN|DATEPART|RELATIVE)/);
            if (result.length && result.length > 1) {
                if (result[1] !== '=') {
                    unsupportedOperator = true;
                }
            }
        });
    }

    api.setState('queryValidation', {
        isPartial: partial,
        hasOr,
        unsupportedOperator
    });
    if ((!hasOr && !unsupportedOperator && !partial) && validQuery != value) {
        api.setState('validQuery', value);
    }
}
