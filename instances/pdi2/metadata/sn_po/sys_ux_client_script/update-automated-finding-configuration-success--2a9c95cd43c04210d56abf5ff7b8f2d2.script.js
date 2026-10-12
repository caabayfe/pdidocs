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
    const {
        message,
        success,
        errorMessages
    } = event.payload.data.output.data.snPo.GlidePromin.updateProminAutomatedFindingConfig;

    let alert = { ...api.state.alert
    };
    let findingConfigurationMap = { ...api.state.findingConfigurationMap
    };

    if (!success) {
        if (errorMessages.length > 0) {
            let msg = [];
            let extraStepMsg = [];
            for (let i = 0; i < errorMessages.length; i++) {
                findingConfigurationMap[errorMessages[i].configuration].invalid = true;
                alert[api.state.automatedFindingForm.type.value][errorMessages[i].configuration].message = errorMessages[i].message;
                alert[api.state.automatedFindingForm.type.value][errorMessages[i].configuration].visible = false;
            }
        }
        api.setState('alert', alert);
        api.setState('findingConfigurationMap', findingConfigurationMap);
        return;
    }

    api.setState('configUpdated', false);
    api.setState('findingCreated', false);
    if (api.state.exit) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'create-automated-finding-config-success',
                status: 'positive',
                icon: 'circle-check-outline',
                content: await helpers.translate('Finding definition saved. You can close the tab and continue later.'),
                action: {
                    type: 'dismiss'
                },
            }],
        });
    } else {
        if (message) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'update-automated-finding-configuration-success',
                    status: 'positive',
                    icon: 'circle-check-outline',
                    content: message,
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }
        if (api.state.automatedFindingForm.name?.applyToSource === 'project') {
            // Navigate to Set improvement opportunities page in project setup
            helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'find-improvement-opportunities'
            }, null, true);
        } else {
            // Navigate to process configuration page
            helpers.navigate.to('process-configuration-details', {
                processId: api.context.props.projectId,
                step: 'improvement-opportunities'
            }, {
                activeTab: 'AUTOMATED'
            }, true);
        }
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
