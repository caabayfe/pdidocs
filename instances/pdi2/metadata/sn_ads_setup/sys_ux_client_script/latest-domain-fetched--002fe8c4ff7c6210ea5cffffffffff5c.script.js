/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var domaindb = api.data.get_user_domain_1;
    var domain = domaindb && domaindb.output.domain;
    if (domain !== "global") {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'alert-1',
                status: 'critical',
                icon: 'circle-info-outline',
                content: await helpers.translate("Guided Setup can be updated only in Global domain. Please change the domain and try again."),
                action: {
                    type: 'dismiss'
                }
            }]
        });
        return;
    }

    var {create_GS, edit_GS, clicked_GS_ID} = api.state;

    if (edit_GS) {
        api.setState('edit_GS', false);
        helpers.navigate.to("introduction", {
            "setupId": clicked_GS_ID
        }, {
            "customId": new Date().getTime()
        });
    }

    if (create_GS) {
        api.setState('create_GS', false);
        helpers.navigate.to("introduction", {
            "setupId": '-1'
        }, {
            "customId": new Date().getTime()
        });
    }
}
