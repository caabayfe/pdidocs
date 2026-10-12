function handler({api, event, helpers, imports}) {
        const url = "$flow-designer.do?sysparm_nostack=true#/welcome/recent-subflow";
        const customPayload = {
            route: null,
            fields: null,
            params: null,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: {
                url
            }
        };
        api.emit('NAV_ITEM_SELECTED', customPayload);
}
