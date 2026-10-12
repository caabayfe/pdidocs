/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const extraParams = api.context.props.extraParams;
    if (extraParams) {
        let extraParamsProp = {};

        //extraParams is generated as a fixed formated string such as: 'query/parent=b424cd23c322310015519f2974d3aeed'
        const propsArray = extraParams.split("/");
        for (let i = 0; i < propsArray.length; i += 2) {
            extraParamsProp[propsArray[i]] = propsArray[i + 1];
        }
        return extraParamsProp;
    }
}
