function script({ api, event, helpers, imports }) {
    //findOnMap script in mapSearchFilterController; passed into mapSearchFilterController via a handled event usually from a card click
    var findData;

    if (event.payload.clear) {
        api.setState('selectedNode', '');
        findData = { nodes: [] };
    } else {
        //first clear any existing timeouts to dismiss the find highlight
        if (api.state.timeoutId) {
            helpers.timing.clearTimeout(api.state.timeoutId);
        }

        findData = event.payload.findData;
        
        //clear the highlight after a few seconds since there's no other way to clear it 
        // other than if the user explicity toggles it off so we'll auto clear it with a timeout (for now)
        var timeoutId = helpers.timing.setTimeout(() => {
            api.setState('selectedNode', '');
            api.emit('SN_UNIFIED_MAP_CTRL#FIND_ON_MAP', { clear: true });
        }, 4000);
        api.setState('timeoutId', timeoutId);
    }

    api.setState('findData', findData);
}
