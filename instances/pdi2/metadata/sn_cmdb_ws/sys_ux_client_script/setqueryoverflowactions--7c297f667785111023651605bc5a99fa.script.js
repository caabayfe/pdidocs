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
    var cardActionJsonArray = [];
    var actionLabel = await helpers.translate('Action');
    var runLabel = await helpers.translate('Run');
    var cardActionJsonObj = {
        id : 'action',
        label : actionLabel,
        items: [
            {
                id : 'run',
                label: runLabel
            }
        ],
        icon : "ellipsis-v-outline"
    };

    if(hasMsEditor(api.context.session.user.roles) || hasAdminOrMaint(api.context.session.user.roles)) {
        var deleteLabel = await helpers.translate('Delete');
        cardActionJsonObj.items.push( {
            id : 'delete',
            label: deleteLabel
        });
    }

    cardActionJsonArray.push(cardActionJsonObj);
    api.setState('overflowActions',cardActionJsonArray);

}
