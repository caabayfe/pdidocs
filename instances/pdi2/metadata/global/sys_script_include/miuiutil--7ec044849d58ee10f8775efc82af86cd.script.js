var MIUIUtil = Class.create();
MIUIUtil.prototype = {
    initialize: function() {},

    createSideNavMenu: function(menuItem) {
        var blockId = gs.generateGUID();
        return {
            id: blockId,
            block_id: 'block_' + blockId,
            active: true,
            name: 'name_' + gs.generateGUID(),
            label: menuItem.title,
            title: menuItem.title,
            type: {
                group: "element",
                name: "Side Nav",
                id: "9ffd5fc9c38501104b8e88c7c840ddb8",
            },
            lazyLoad: "0",
            children: [],
            props_details: {
                type: "custom",
                endpoint: menuItem.endpoint || menuItem.route,
                nav_payload: {
                    route: menuItem.route,
                    fields: menuItem.fields,
                    params: menuItem.params
                }
            }
        };
    },

    type: 'MIUIUtil'
};
