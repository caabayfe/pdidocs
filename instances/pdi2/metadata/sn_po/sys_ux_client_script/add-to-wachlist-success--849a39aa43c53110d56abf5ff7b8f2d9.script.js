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
        const success = event.payload.data.output.data.snPo.GlidePromin.addUsersToProjectWatchList.success;
        if (!success) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    header: 'Error:',
                    status: 'critical',
                    icon: 'exclamation-triangle-outline',
                    content: await helpers.translate('Failed to add you to watch list. Please try again!'),
                    action: {
                        type: 'dismiss'
                    },
                }]
            });
            return;
        }

        const updatedProject = {
            ...api.state.projectData,
            watchList: [...new Set([...api.state.projectData.watchList, api.state.projectData.userId])],
        };

        api.setState('projectData', updatedProject);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    status: 'positive',
                    header: await helpers.translate('Added to watch list:'),
                    icon: 'circle-info-outline',
                    content: await helpers.translate('You will receive an email after the mining is complete.'),
                    action: {
                        type: 'dismiss'
                    },
                }]
            });
        }
