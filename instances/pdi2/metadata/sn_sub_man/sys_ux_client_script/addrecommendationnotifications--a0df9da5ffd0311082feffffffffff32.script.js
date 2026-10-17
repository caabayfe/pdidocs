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
    // Determine the correct label for info message    
    const issuesTabID = api.state.issuesTabID;
    const output = api.data.execute_issues_recommendations.output;
    const recommendationIds = api.state.selectedRecommendationRecords;
    switch (output) {
        case 'duplicates':
            const duplicatesTranslation = issuesTabID === 't2' ? helpers.translate('Please only select one subscription to map to a given custom application.') : helpers.translate('Please only select one subscription to map to a given global custom table.');
            duplicatesTranslation.then((str) => {
                displayNotification(api, "duplicateRecommendationAlert", "critical", str, "circle-info-outline");
            });
            break;
        case 'failure':
            helpers.translate('Failed to map recommendations. There was an issue with the backend script. Please try again later.').then((str) => {
                displayNotification(api, "recommendationFailureAlert", "critical", str, "circle-info-outline");
            });
            break;
        case 'success':
            const successTranslation = helpers.translate('Selected items have been successfully mapped.');
            successTranslation.then((str) => {
                displayNotification(api, "recommendationSuccessAlert", "positive", str, "circle-check-outline");
            });
            break;
        default:
            return;
    }

    function displayNotification(api, id, status, message, icon) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: id,
                status: status,
                icon: icon,
                "content": {
                    "type": "html",
                    "value": message
                },
                action: {
                    type: "dismiss"
                },
            }]
        });

        api.setState('listRefresh', {
            timestamp: new Date().getTime(),
            background: true
        });
    }
}
