function script({ api, event, helpers, imports }) {
    //requestToUpdatePageProps script in Map Search Filter UI Controller; fired after any control in the module has a state change and needs to update the URL
    api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
        params: event.payload.params
    });
}
