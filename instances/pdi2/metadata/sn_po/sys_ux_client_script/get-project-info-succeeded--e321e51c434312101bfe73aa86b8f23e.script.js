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
            isShared,
            userInfo,
            autoRetiredMessage,
        },
    } = api.data.get_project_info.output.data.snPo.GlidePromin.getProjectInfo;

    api.setState('projectPermissions', permissions);

    if (isShared) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'project-shared-message',
                status: 'info',
                icon: 'circle-info-outline',
                content: await helpers.translate('Since this project is shared with you, you have limited access to modify this definition'),
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }

    api.setState('userInfo', {
        isSnPoAdmin: userInfo.isSnPoAdmin, 
        isSnPoPowerUser: userInfo.isSnPoPowerUser
    });

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
}
