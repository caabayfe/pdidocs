/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const description = api.state.feedbackTaskDescription;
    if (!description || !description.trim()) {
        const errorMessage = await helpers.translate('Description is required.');
        api.setState('isDescriptionInvalid', true);
        api.setState('descriptionMessages', [{status: 'error', content: errorMessage}]);
        return;
    }
    api.setState('isDescriptionInvalid', false);
    api.setState('descriptionMessages', []);
    api.emit('_KNOWLEDGE_CENTER#CREATE_FEEDBACK_TASK_RELAY_1fc85b47ffbd22107a91ffffffffff2f', {
        description: description,
        selectedGapSysIds: api.state.taskData?.selectedGapSysIds ?? []
    });
    helpers.modal.close();
}
