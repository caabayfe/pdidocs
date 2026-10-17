function handler({ api, helpers, event, imports }) {
    const { navigateTo } = imports["global.CiRoutingUtils"]();

    let _route = 'general';
    if (event.payload && event.payload.item){
        _route = event.payload.item.id || 'general';
    }
    navigateTo(api, { route: _route });
}
