/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        success,
        projectInfo: {
            permissions,
            autoRetiredMessage,
            userInfo,
        },
    } = api.data.get_project_info.output.data.snPo.GlidePromin.getProjectInfo;

    // Permissions
    if (permissions.iscreatorUserPresent != "") {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'project-dirty-message',
                status: 'critical',
                icon: 'circle-close-outline',
                content: await helpers.translate("The creator's access will be used to generate a model but we cannot find '{0}' in the user table. Please contact your system administrator to update the 'Created by' field.", permissions.iscreatorUserPresent),
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }
    if (!permissions.getLEProgressTypeFieldPresent) {
        api.setState("lEProgressTypeFieldPresent", true);
    }

    api.setState('projectPermissions', permissions);

    const autoRetireTooltip = await helpers.translate("Check the box to automatically set the project's status to 'Retired' due to inactivity for {0} days. (The mined versions eventually get cleaned for retired projects)", permissions.auto_retire);
    api.setState('autoRetireTooltip', autoRetireTooltip);

    // Auto-retire
    if (autoRetiredMessage) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'previous-model-info-msg',
                status: 'warning',
                icon: 'info-circle-outline',
                content: autoRetiredMessage,
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    // User info
    api.setState('userInfo', {
        isSnPoAdmin: userInfo.isSnPoAdmin,
        isSnPoPowerUser: userInfo.isSnPoPowerUser,
        isSnAiaViewer: userInfo.isSnAiaViewer
    });
}
