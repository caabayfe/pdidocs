/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let fieldDetails = {...api.state.selectedActivityFieldDetails};

    const activityListSelectorItems = {
        'activity': {}
    };


    if (fieldDetails && fieldDetails.internalType === 'choice') {
        const choiceFields = event.payload.data.output.data.GlideChoiceColumn_Query.getChoiceFields;
        const listItems = [];
        for (const field of choiceFields) {
            listItems.push({
                id: field.rawValue,
                label: field.displayValue,
            });
            activityListSelectorItems['activity'][field.rawValue] = {
            id: field.rawValue,
            label: field.displayValue,
        };
        }
        api.setState('fieldSelectValuesListItems', listItems);
        api.setState('activityValues', listItems);
    }
}
