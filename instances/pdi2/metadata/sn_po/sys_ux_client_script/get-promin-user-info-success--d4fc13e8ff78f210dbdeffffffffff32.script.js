/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        isSnPoAdmin,
        isSnPoPowerUser,
        isSnAiaViewer
    } = api.data.get_promin_user_info.output.data.snPo.GlidePromin.prominGetUserInfo.userInfo;
    api.setState('userInfo', { isSnPoAdmin, isSnPoPowerUser, isSnAiaViewer });
}
