/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     //Save changes before publish
    api.emit("GFORM_SAVE_RELAY_195fd4970f0210107d20409dc4767e0a");
    api.data.publish_knowledge_article.execute({
        "articleId":api.context.props.sysId,
        "articleTable":api.context.props.table
    });
    api.emit("GLIDE_FORM_1_RELOAD_RELAY_429f31fbdbebd01045cf5ce4dc96193d");
    helpers.modal.close();
}
