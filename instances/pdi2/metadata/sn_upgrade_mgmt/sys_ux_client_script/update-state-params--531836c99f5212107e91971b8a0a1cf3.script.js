/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!event) return;

    const {
        name,
        elementId,
        payload
    } = event;

    const result = payload.data.output.result;
    const error = result.error;
    if (error) {
        api.setState('showAlert', true);
        api.setState('alertMsg', error);
    } else {
        const {
            interactionSysId,
            contextSysId,
            resetUrl,
            recordAction
        } = result;
        // As this page can be used as template, added selectedStage, selectedActivity as variable to avoid including it in restOptionalParams.
        const {
            setupId,
            interactionId,
            selectedPlaybook,
            selectedStage,
            selectedActivity,
            ...restOptionalParams
        } = api.context.props;
        api.setState('interactionId', interactionSysId);
        api.setState('contextSysId', contextSysId);
        api.setState('recordAction', recordAction);
        // if (resetUrl || (selectedPlaybook && selectedPlaybook != contextSysId) || (!selectedPlaybook && contextSysId) || recordAction == 'CREATE') {
        //     helpers.navigate.to("guided", {
        //         "setupId": setupId,
        //     }, {
        //         ...restOptionalParams,
        //         "interactionId": interactionId,
        //         "selectedPlaybook": contextSysId,
        //         "customId": new Date().getTime(),
        //     }, true);
        // }
    }
}
 
