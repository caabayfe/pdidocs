/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var note = await helpers.translate("Note: Activating this copy will deactivate all other versions of the ‘{0}’ skill, including the default version.", api.context.props.payload.guided_context.skill_parent_name);
    api.setState("note", note);
}
