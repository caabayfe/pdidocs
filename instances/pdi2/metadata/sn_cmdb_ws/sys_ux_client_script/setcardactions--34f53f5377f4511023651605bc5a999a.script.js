/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        hasMsEditor,
        hasAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();

     if(hasMsEditor(api.context.session.user.roles) || hasAdminOrMaint(api.context.session.user.roles)) {
        var cardActionJsonArray = [];
        var actionLabel = await helpers.translate('Action');
        var modifyLabel = await helpers.translate('Modify');
        var deleteLabel = await helpers.translate('Delete');
        var cardActionJsonObj = {
            id : 'action',
            label : actionLabel,
            items: [
                {
                    id : 'modify',
                    label: modifyLabel
                },
                {
                    id : 'delete',
                    label : deleteLabel
                }
            ],
            icon : "ellipsis-v-outline"
        };
        cardActionJsonArray.push(cardActionJsonObj);
        api.setState('cardActions',cardActionJsonArray);
     }
}
