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
    
    let eventPayload;
    if (event.elementId == 'create_record_1') {
        eventPayload = event.payload.data.output.data.GlideRecord_Mutation.insert_help_guidance;
    } else if (event.elementId == 'update_record_1') {
        eventPayload = event.payload.data.output.data.GlideRecord_Mutation.update_help_guidance;
    }

    if (eventPayload) {
        if (event.elementId == 'create_record_1') {
            helpers.navigate.to("setup-detail", {
                "setupId": eventPayload.sys_id.value,
                "processId": eventPayload.process_definition.value
            });
        } else {
            helpers.navigate.to("setup-detail", {
                "setupId": api.context.props.id,
                "processId": (eventPayload.process_definition.value || api.state.processId)
            });
        }
    } else {
        api.setState('hideAlert', false);
    }
    return;
}
