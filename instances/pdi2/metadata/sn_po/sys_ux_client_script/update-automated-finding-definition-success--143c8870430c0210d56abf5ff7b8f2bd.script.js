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
        status,
        findingId,
    } = event.payload.data.output.data.snPo.GlidePromin.updateProminAutomatedFinding;

    if (status == 'DUPLICATE_RECORD') {
        const automatedFindingForm = { ...api.state.automatedFindingForm
        };
        automatedFindingForm.isDuplicateMsgAlertHidden = false;
        api.setState('duplicateFindingId', findingId);
        api.setState('automatedFindingForm', automatedFindingForm);
        return;
    }
    if (!success) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'update-automated-finding-definition-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
        return;
    }
    api.setState('formUpdated', false);
    api.setState('findingCreated', false);
    if (api.state.exit) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'create-automated-finding-definition-success',
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
                    id: 'update-automated-finding-definition-success',
                    status: 'positive',
                    icon: 'circle-check-outline',
                    content: message,
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }
        const automatedFindingForm = { ...api.state.automatedFindingForm
        };
        automatedFindingForm.isAlertHidden = true;
        automatedFindingForm.impacted_kpi.messages = [];
        api.setState('automatedFindingForm', automatedFindingForm);
        api.data.look_up_finding_configuration.refresh();
        const stageItems = api.state.stepper.map((item) => {
            let state = 'done';
            return { ...item,
                disabled: false,
                progress: item.id == 'configure' ? 'none' : state
            };
        });
        api.setState('stepper', stageItems);
        api.setState('selectedStage', 'configure');
    }
}
