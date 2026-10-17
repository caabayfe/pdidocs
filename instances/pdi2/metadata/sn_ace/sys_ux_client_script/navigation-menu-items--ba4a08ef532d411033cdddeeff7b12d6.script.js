function evaluateEvent({
    api,
    event
}) {
    /*

    To Do: Use Navigation Payload client script include (sys_id=4c8a77abb7a151109cfe23508e11a93b)
    to import below methods once arg `imports` is available inside `evaluateEvent` method

    */

    // Prepare navigation payload with route, required params (fields) and optional params (params)
    const generateNavigationPayload = (endpoint, currentRouteRequiredParams, currentRouteOptionalParams) => {
        try {
            if (!endpoint)
                return null;

            let payload = {
                reload: true
            };
            const [route, params] = endpoint.split('?');
            if (!route)
                return null;

            payload.route = route;
            if (params) {
                payload.fields = {};
                const allParams = params.split('&');
                allParams.forEach(param => {
                    if (param.match(/optional=(.+)/)) {
                        payload.params = {};
                        let optionalParams = param.match(/optional=(.+)/)[1].split('^');
                        optionalParams.forEach(optionalParam => {
                            const [optionalParamName, optionalParamValue] = optionalParam.split('=');
                            payload.params[optionalParamName] = getParamValue(optionalParamValue, currentRouteOptionalParams);
                        });
                    } else {
                        const [paramName, paramValue] = param.split('=');
                        payload.fields[paramName] = getParamValue(paramValue, currentRouteRequiredParams);
                    }
                });
            }

            return payload;
        } catch (error) {
            console.error('[ACE] ERROR generating navigation payload');

            return null;
        }
    }


    const areEqual = (o1, o2) => {

        let obj1 = o1 || {};
        let obj2 = o2 || {};

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length)
            return false;

        for (let key1 of keys1) {
            if (obj1[key1] !== obj2[key1])
                return false;
        }

        return true;
    }

    const isEndpointUrlLoaded = (endpoint, {
        route,
        fields,
        params
    }) => {
        const payloadFromEndpoint = generateNavigationPayload(endpoint, fields, params);

        if (!payloadFromEndpoint || payloadFromEndpoint.route !== route || !areEqual(payloadFromEndpoint.fields, fields) || !areEqual(payloadFromEndpoint.params, params))
            return false;

        return true;
    }

    // Replace placeholder template text with current route parameters 
    const getParamValue = (template, currentRouteParams) => {
        const templateMatches = template.match(/{(.+)}/);
        if (!templateMatches)
            return template;

        const matchedName = templateMatches[1];

        return currentRouteParams[matchedName] || '';
    }



    // Compare items with current route and prepare selected and expanded items arrays
    const findSelectedAndExpandedItems = (menuItems, selectedItems, expandedItems) => {
        for (let menuItem of menuItems) {
            if (menuItem.children.length > 0) {
                let newExpandedItemsList = expandedItems.length > 0 ? [...expandedItems, [...expandedItems[expandedItems.length - 1], menuItem.id]] : [
                    [menuItem.id]
                ];
                let searchResultInChildren = findSelectedAndExpandedItems(menuItem.children, [...selectedItems, menuItem.id], newExpandedItemsList);

                if (searchResultInChildren !== null)
                    return searchResultInChildren;
            } else {
                if([menuItem.props_details.endpoint].concat(menuItem?.props_details?.contained_pages || []).some(ep=>isEndpointUrlLoaded(ep, selectedContent)))
                    return {
                        selectedItems: [
                            [...selectedItems, menuItem.id]
                        ],
                        expandedItems: expandedItems
                    };

            }
        }

        if (selectedItems.length === 0) {
            return findSelectedAndExpandedItemsFallback(menuItems, selectedItems, expandedItems);
        }

        return null;
    }

    const findSelectedAndExpandedItemsFallback = (menuItems, selectedItems, expandedItems) => {
        for (let menuItem of menuItems) {
            if (menuItem.children.length > 0) {
                let newExpandedItemsList = expandedItems.length > 0 ? [...expandedItems, [...expandedItems[expandedItems.length - 1], menuItem.id]] : [
                    [menuItem.id]
                ];
                let searchResultInChildren = findSelectedAndExpandedItemsFallback(menuItem.children, [...selectedItems, menuItem.id], newExpandedItemsList);

                if (searchResultInChildren !== null)
                    return searchResultInChildren;
            }
            if([menuItem.props_details.endpoint].concat(menuItem?.props_details?.contained_pages || []).some(ep=>areRouteAndFieldsMatching(ep, selectedContent))) {
                return {
                    selectedItems: [
                        [...selectedItems, menuItem.id]
                    ],
                    expandedItems: expandedItems
                };
            }
        }

        return null;
    }

    const areRouteAndFieldsMatching = (endpoint, {
        route,
        fields,
        params
    }) => {
        const payloadFromEndpoint = generateNavigationPayload(endpoint, fields, params);

        if (!payloadFromEndpoint || payloadFromEndpoint.route !== route || !areEqual(payloadFromEndpoint.fields, fields))
            return false;

        return true;
    }

    function isTheSamePage(endpointValue, pageRoute) {
        if (!endpointValue || !pageRoute)
            return false;

        const [pageRouteFromEndpoint] = endpointValue.split('?');

        return pageRouteFromEndpoint === pageRoute;
    }

    function isTheSamePage(endpointValue, pageRoute) {
        if (!endpointValue || !pageRoute)
            return false;

        const [pageRouteFromEndpoint] = endpointValue.split('?');

        return pageRouteFromEndpoint === pageRoute;
    }

    function setMatchedModuleFromChildItems(menuItem, targetNav, navModule) {
        for (let currentMenuItem of menuItem.children) {
            var currentNavName = currentMenuItem.props_details.nav_payload.params.aceNav;
            if (currentNavName == targetNav) {
                matchedModule.push(navModule);
                searchResult = {
                    selectedItems: [
                        [menuItem.id],
                        [menuItem.id, currentMenuItem.id]
                    ],
                    expandedItems: [
                        [menuItem.id]
                    ]
                };
            }
        }
    }

    function setMatchedModuleByParam(navModules) {
        let expandedItmes = [];

        for (let moduleItem of navModules) {
            var menuItems = moduleItem.menu;
            for (let currentMenuItem of menuItems) {
                if (currentMenuItem.props_details.nav_payload) {
                    var currentNavName = currentMenuItem.props_details.nav_payload.params.aceNav;
                    var targetNav = api.state.selectedContent.params.aceNav;
                    if (currentMenuItem.children)
                        setMatchedModuleFromChildItems(currentMenuItem, targetNav, moduleItem);

                    if (currentNavName == targetNav) {
                        if (currentMenuItem.children) {
                            expandedItmes = [
                                [currentMenuItem.id]
                            ]
                        }
                        matchedModule.push(moduleItem);
                        searchResult = {
                            selectedItems: [
                                [currentMenuItem.id]
                            ],
                            expandedItems: expandedItmes
                        };
                    }
                }
            }
        }
    }

    function setMatchedModuleByRoute(navModules) {
        return navModules.some(navModule => {
            matchedModule.push(navModule);
            var endpoint = [navModule.page_route || navModule.props_details.endpoint].concat(navModule?.props_details?.contained_pages || []);
            const isMatchedRoute = endpoint.some(ep=>isTheSamePage(ep, route));
            if (!isMatchedRoute) {
                if (!setMatchedModuleByRoute(navModule.menu || navModule.children)) {
                    matchedModule.pop();
                } else {
                    return true;
                }
            }

            return isMatchedRoute;
        });
    }


    const matchedModule = [];
    const SIDE_NAV_ID = "9ffd5fc9c38501104b8e88c7c840ddb8";
    const MODULE_ITEM_ID = "76dddbc9c38501104b8e88c7c840dd9f";
    const SCREEN_CHANGED_EVENT_NAME = "MAIN_SELECTED_CONTENT_CHANGED";

    let route, selectedContent;
    if (event.name === SCREEN_CHANGED_EVENT_NAME) {
        route = event.payload.selectedContent.route;
        selectedContent = event.payload.selectedContent;
    } else {
        route = api.state.currentRoute || api.elements.canvasLayout.activeScreenId;
        selectedContent = api.state.selectedContent;
    }
    
    const menuItems = api.data.ace_fetch_menu_items.output || {};
    if (menuItems && menuItems.length > 0) {
       menuItems.modules.forEach(module => {
           module.isActive = false;
        });
   }


    let searchResult = null;
    let items = {
        propName: 'navItems',
        value: []
    };

    if (!route) return items;

    setMatchedModuleByRoute(menuItems.modules || []);


    if (matchedModule.length == 0 && "params" in selectedContent) { // If Module is not identified by Route try by param(aceNav)
        if (selectedContent && selectedContent.params && "aceNav" in selectedContent.params) {
            setMatchedModuleByParam(menuItems.modules || []); // Get nav name from Nav Param
        }
    }

    if (matchedModule.length > 0) {

        // Preparing tree items for parameterized nav items
        if (!matchedModule[0].parent_block_id && matchedModule[0].menu && matchedModule[0].menu.length > 0) {
            if (searchResult == null) {
                searchResult = findSelectedAndExpandedItems(matchedModule[0].menu, [], []);
            }
            if (searchResult !== null) {
                matchedModule[0].selectedItems = searchResult.selectedItems;
                matchedModule[0].expandedItems = searchResult.expandedItems;
                matchedModule[0].isActive = true;
                items = {
                    propName: 'navItems',
                    value: matchedModule[0]
                };

                return items;
            }
        }
        const navItemIds = matchedModule.map((pathItem) => {
            return (pathItem.type.id == SIDE_NAV_ID) ? pathItem.id : '';
        }).filter(id => Boolean(id));

        matchedModule[0].selectedItems = [navItemIds];
        matchedModule[0].expandedItems = [navItemIds.slice(0, navItemIds.length - 1)];
        matchedModule[0].isActive = true;
        items = {
            propName: 'navItems',
            value: matchedModule[0]
        };
    }

    if (matchedModule.length == 0) { // If no module is matched check for contained pages of the module
        var modules = menuItems.modules || [];
        var selectedItems = modules.filter(function(module) {
            const contained_pages = module.props_details.contained_pages;

            return contained_pages && contained_pages.indexOf(route) != -1;
        });
        if (selectedItems && selectedItems[0]) {
            selectedItems[0].isActive = true;
        }
        items = {
            propName: 'navItems',
            value: selectedItems[0] || []
        };
    }
    return items;
}
