function script({ api, event, helpers, imports }) {
    /** ApplicationServiceInputDataChanged in Application Services Module controller
     *Fired when the raw application services data is changed. Reformat this 
     * data for use by the application services card repeater.
     * ciSysIds is an array of CIs
     * - if it is a single that means a node is selected. 
     * - if it is n, the node/connection has been deselected.
     */
    var cardData = event.payload.data.output.appServiceArray || [];
    if (cardData.errors) {
        // TODO: Need mocks for errors
    }

    if (!cardData || cardData.length === 0) {
        api.setState('appServiceInputData', []);
        api.setState('appServiceTotalCount', 0);
        api.setState('appServiceCardArray', []);
        return;
    }
    
    // Set controller state objects
    api.setState('appServiceInputData', cardData);
    api.setState('appServiceCardArray', cardData);
    api.setState('appServiceTotalCount', cardData.length);
}
