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

    api.setState('hideRecommendationsLoader', false);
    api.setState('hideRecommendationsList', true);
    api.setState('recommendationsBeingProcessed', true);

    api.setState('exRecords', api.state.exceptedRecordsAddGroupsFlow);
    api.setState('isSelectAllSelected', api.state.isSelectAllSelectedAddGroupsFlow);
    /*
    groupsToAddToSubscription client state parameter is used by the 'Add Unconfirmed Groups to Subscription' data broker. Change in state will
    trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this
    */
    api.setState('groupsToAddToSubscription', api.state.selectedRelevantGroupsList);

    //Setting this client state parameter to true so that the data resource event refresh_list can be triggered
    //after Add Groups to Subscription data resource data fetch is completed
    api.setState('shouldRefreshList', true);

    //getting the output of data source
    const output = api.data.add_groups_to_subscription.output.toLowerCase();
    if (output == 'true') {
        // const groupCount = api.data.relevant_selected_groups.output.data.GlideAggregate_Query[0].count;
        // const userCount = api.data.relevant_selected_groups.output.data.GlideAggregate_Query[0].sum;

        helpers.translate('Groups have been added. Please refresh this page in a few minutes to see the updated consumed totals.')
            .then((text) => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "allocatedUsersCountAlert",
                        status: "positive",
                        icon: "circle-check-outline",
                        "content": {
                            "type": "html",
                            "value": text
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
            });
    } else {
    //display notification for group allocation failure
        helpers.translate('Failed to add record to the database. There was an issue with the backend script. Please try again later.')
            .then((text) => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "allocatedAFailAlert",
                        status: "critical",
                        icon: "circle-info-outline",
                        "content": {
                            "type": "html",
                            "value": text
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
            });
    }
}
