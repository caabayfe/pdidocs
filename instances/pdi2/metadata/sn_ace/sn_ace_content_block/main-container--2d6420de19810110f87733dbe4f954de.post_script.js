(function(context) {
    /*
    	context = {
    		'block_id': @sysId,
    		'name': @String,
    		'title': @String,
    		'subtitle': @String,
    		'order': @Number,
    		'type': @Object,
    		'children': @Array[context],
    		'props_details': @Object
    	};
    */
    //put your code here
    var contentTypes = {
        container: {
            title: gs.getMessage('Containers'),
            order: 0
        },
        element: {
            title: gs.getMessage('Elements'),
            order: 1
        },
        action: {
            title: gs.getMessage('Actions'),
            order: 2
        },
        custom: {
            title: gs.getMessage('Custom Contents'),
            order: 3
        }
    };

    function getActionContextTemplate(title, props_details) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'action_' + gs.generateGUID(),
            title: title,
            subtitle: '',
            order: 0,
            type: {
                group: "Action",
                name: "Button",
                group_id: "36e74239c3e401104b8e88c7c840dd11",
                id: "02c8c279c3e401104b8e88c7c840dde2",
                route: "button",
                props: []
            },
            children: [],
            props_details: props_details
        };
    }

    function getCardsForContentTypes(contentTypeId, title) {
        return {
            block_id: contentTypeId,
            name: 'card_' + gs.generateGUID(),
            title: title,
            subtitle: '',
            order: 0,
            type: {
                group: "Card",
                name: "Content Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "59684a39c3e401104b8e88c7c840ddd1",
                route: "card_content",
                props: []
            },
            children: [
                getActionContextTemplate(
                    gs.getMessage('Proceed'), {
                        action_type: 'event',
                        event_name: 'CONTENT_BLOCK_PROCEED_CLICKED',
                        contentTypeId: contentTypeId
                    }
                )
            ],
            props_details: {
                image: '/onboarding-history.svg'
            }
        };
    }

    // CODE STARTS HERE
    var contentBlockData = [];
    for (var contentType in contentTypes) {
        contentBlockData.push({
            block_id: contentType,
            name: 'content' + gs.generateGUID(),
            title: contentTypes[contentType].title,
            subtitle: '',
            order: contentTypes[contentType].title,
            type: {
                group: "Container",
                name: "Three-col section",
                group_id: "cba7cef5c3e401104b8e88c7c840ddf2",
                id: "215aebc4ebf4011090fa99602a5228b7",
                route: "three-col-section",
                props: []
            },
            children: [],
            props_details: {}
        });
    }
    var query = '';
    var cbTypeGr = new GlideRecord('sn_ace_content_block_type');
    if (context.pageParams && context.pageParams.aceAppConfigId) {
        query = "ace_appISEMPTY^ORace_app=" + context.pageParams.aceAppConfigId;
    }
    if (query) cbTypeGr.addEncodedQuery(query);
    cbTypeGr.orderBy("name");
    cbTypeGr.query();
    while (cbTypeGr.next()) {
        var category = cbTypeGr.getValue('category');
        var section;
        if (category) {
            section = contentTypes[category].order;
        }
        if (section >= 0) {
            contentBlockData[section].children.push(getCardsForContentTypes(cbTypeGr.getValue('sys_id'), cbTypeGr.getValue('name')));
        } else {
            contentBlockData[contentTypes['custom'].order].children.push(getCardsForContentTypes(cbTypeGr.getValue('sys_id'), cbTypeGr.getValue('name')));
        }
    }

    // FIXME: aggressive cleanup required.
    if (context.pageParams.table == 'sn_ace_page') {
        context.children = [contentBlockData[contentTypes['container'].order]];
    } else if (context.pageParams.table == 'sn_ace_content_block') {
        var contentBlockGr = new GlideRecord('sn_ace_content_block');
        if (contentBlockGr.get(context.pageParams.sysId)) {
            var contentBlockTypeGr = new GlideRecord('sn_ace_content_block_type');
            if (contentBlockTypeGr.get(contentBlockGr.getValue('type'))) {
                var category = contentBlockTypeGr.getValue('category');
                if (category == 'container') {
                    // if container then show only elements and custom
                    context.children = [contentBlockData[1], contentBlockData[3]];
                } else if (contentBlockTypeGr.sys_id == '76dddbc9c38501104b8e88c7c840dd9f') {
                    // if type is module item then children can only be nav items
                    var allowedContentTypes = contentBlockData[1].children.filter(function(contentBlock) {
                        return contentBlock.block_id == '9ffd5fc9c38501104b8e88c7c840ddb8';
                    });
                    contentBlockData[1].children = allowedContentTypes;
                    context.children = [contentBlockData[1]];
                }
            }
        }
    }

    if (!context.children.length) {
        context.children = contentBlockData;
    }

})(context);
