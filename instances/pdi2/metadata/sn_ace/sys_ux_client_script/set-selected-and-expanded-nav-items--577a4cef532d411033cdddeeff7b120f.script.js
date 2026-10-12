function handler({
    api,
    helpers,
    event,
    imports
}) {

    const payload = event.payload.value || [
        []
    ];
    const navItems = api.state.navItems || [];
    const previousResults = [];
    const navItemPayload = payload[0].map(function(item) {
        previousResults.push(item);
        return [...previousResults];
    });
    navItems.expandedItems = navItemPayload;
    navItems.selectedItems = navItemPayload;

    api.setState('navItems', navItems);



}
