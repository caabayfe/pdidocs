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
    const permissions = event.payload.data.output.data.snPo.GlidePromin.prominIsProjectShared;
    if (permissions.result) {
        const projectStatusValues = api.state.projectStatusInput.filter(type => type.id != "RETIRED");
        api.setState('projectStatusInput', projectStatusValues);
        const autoRetire = { ...api.state.autoRetire,
            readOnly: true
        };
        api.setState("autoRetire", autoRetire);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'project-shared-message',
                status: 'info',
                icon: 'circle-info-outline',
                content: await helpers.translate("Since this project is shared with you, you have limited access to modify this definition"),
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }
}
