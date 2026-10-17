function handler({api, event, helpers}) {
    if (event.payload.table === "sys_hub_flow") {
        const {sys_id} = event.payload;
        const url = "$flow-designer.do?sysparm_nostack=true#/sub-flow-designer/" + sys_id;
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
    } else {
        helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null,
            {
                url: '/nav_to.do?uri=/' + event.payload.table + ".do?sys_id=" + event.payload.sys_id
            },
        );
    }
}
