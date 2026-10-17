/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const utils = imports["sn_km_center.ArticleAssistUIUtils"](api, helpers);
    //set results (check if results match form still)
    const results = api.data.transform_article_assist_results.output;
    utils.pullOutModifiedResults(results, false);

    //set isLoading
    api.setState("isLoading", false);

    //Set isReadOnly
    const contentFields = api.data.article_optimization_controller.contentFields;
    const fields = api.data.form_controller.form.fields;
    let isReadOnly = false;
    contentFields.forEach(field => {
        if (fields[field.id].readonly) {
            isReadOnly = true;
        }
    });
    api.setState("isReadOnly", isReadOnly);
}
