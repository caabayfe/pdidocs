/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const classificationFields = api.state.classificationFields.map((item) => {
        return {
            ...item,
            selected: false
        };
    });

    api.setState('classificationFields', classificationFields);
}
