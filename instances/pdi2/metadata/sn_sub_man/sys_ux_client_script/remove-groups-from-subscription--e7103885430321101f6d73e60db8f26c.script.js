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


    api.setState('isSelectAllSelectedRemoveFlowDataSourceMap', api.state.isSelectAllSelectedRemoveGroupsFlow);
    api.setState('exRecordsRemoveFlow', api.state.exceptedRecordsRemoveGroupsFlow);
    /*
        groupsToRemoveFromSub client state parameter is used by the 'Remove Groups from Subscription' data broker. Change in state will
        trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this
        */
    api.setState('groupsToRemoveFromSub', api.state.selectedRemoveGroupsList);

    //Setting this client state parameter to true so that the data resource event refresh_list can be triggered
    //after Remove Groups from Subscription data resource data fetch is completed
    api.setState('shouldRefreshList', true);

    const output = api.data.remove_groups_from_subscription_1.output.toLowerCase();
    if (output == 'true') {
        //Notifications for the data transform execution are not being executed the first time. Added a data resource refresh on page ready to fix this
        //display notification for allocated users
        helpers.translate('Groups are being removed now. Please refresh this page in a few minutes to see the updated consumed totals.')
            .then((text) => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "removedUsersCountAlert",
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
    }
}
