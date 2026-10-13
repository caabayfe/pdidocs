/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {

    const navItems = api.state.navItems;
    if (!navItems || navItems.length <=0) return;

    let route = api.context.props.route || navItems[0].id;
    
    let currentNavItem = navItems.find(item => item.id === route); 
    if (!currentNavItem) { // check for children items
        let parentNavItem = navItems.find(item => {
            if (item.children) return item.children.find(item => item.id === route); 
        });
        currentNavItem = parentNavItem || navItems[0];
    }
    
    let selectedNavItems = [[route]];
    let expandedNavItems = [[currentNavItem.id]];
    if (route != currentNavItem.id) { 
        // selected nav item is a child menu item
        selectedNavItems = [[ currentNavItem.id, route]];
    }
    api.setState("selectedNavItems", selectedNavItems);
    api.setState("expandedNavItems", expandedNavItems);
}
