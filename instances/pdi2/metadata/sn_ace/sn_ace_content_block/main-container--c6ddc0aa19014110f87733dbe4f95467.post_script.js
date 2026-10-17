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

    function getActionContextTemplate(title, order, props_details) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'action_' + gs.generateGUID(),
            title: title,
            subtitle: '',
            order: order,
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

    function createCardContext(id, title, image, order) {
        return {
            block_id: id,
            name: 'card_' + gs.generateGUID(),
            title: title,
            subtitle: '',
            order: order++,
            type: {
                group: "Card",
                name: "Content card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "59684a39c3e401104b8e88c7c840ddd1",
                route: "card_content",
                props: []
            },
            children: [
                getActionContextTemplate(
                    gs.getMessage('Proceed'),
                    1, {
                        action_type: 'event',
                        event_name: 'CONTENT_BLOCK_PROCEED_CLICKED',
                        page_creation_type: id
                    }
                )
            ],
            props_details: {
                image: image
            }
        };
    }

    var pageCreationContentData = [{
            id: 'create-from-scratch',
            title: gs.getMessage('Create from scratch'),
            image: '/default_search_empty_state_image.png'
        },
        {
            id: 'create-from-ace-template',
            title: gs.getMessage('Create from ACE template'),
            image: '/default_search_empty_state_image.png'
        },
        {
            id: 'create-from-existing-ace-page',
            title: gs.getMessage('Create from existing ACE Page'),
            image: '/default_search_empty_state_image.png'
        },
        {
            id: 'create-from-uib-template',
            title: gs.getMessage('Create from UIB template'),
            image: '/uib-favicon-128.png'
        }
    ];
    var order = 0;
    for (var i in pageCreationContentData) {
        context.children.push(createCardContext(pageCreationContentData[i].id, pageCreationContentData[i].title, pageCreationContentData[i].image, order));
    }
})(context);
