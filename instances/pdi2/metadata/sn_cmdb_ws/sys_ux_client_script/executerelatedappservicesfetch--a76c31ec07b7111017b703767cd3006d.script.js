function script({api, event}) { 
    /** ExecuteRelatedAppServicesFetch in Application Services Module controller
     * Fired when the list of sys_id has changed during map interaction, fetches new services related to the CI(s)
     */

    if (event.payload.name === "timestamp" || (!api.context.props.ciSysIds || !api.context.props.ciSysIds.length)) {
        // reset cards states
        api.setState('appServiceArray', []);
        api.setState('appServiceTotalCount', 0);
        api.setState('appServiceCardArray', []);
        if(event.payload.name !== "timestamp") return;
    }
    api.data.app_services_fetch.execute({
        "ciSysIds" : api.context.props.ciSysIds
    });
    
}
