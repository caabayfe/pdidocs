function transform(input) {
    var searchResults = [];
    var data = input.block_id;
    var util = new ACEAppBuilderUtil();
    try {
        data.forEach(function(contentBlockId) {
            var gr = new GlideRecord('sn_ace_content_block');
            gr.addQuery('sys_id', contentBlockId);
            gr.addQuery('active', true);
            gr.query();
            if (gr.next()) {
                var currentSearchResult = getSearchBlockTemplate();
                var contentBlockInfo = util._getContentBlockInfo(gr, contentBlockId);
                var title = contentBlockInfo.title;
                var subtitle = contentBlockInfo.subtitle;
                var pageId = gr.getValue('document_id');
                if (title) {
                    currentSearchResult.title = title;
                    currentSearchResult.subtitle = subtitle;
                    if (pageId) {
                        var grpage = new GlideRecord('sn_ace_page');
                        if (grpage.get(pageId)) {
                            var route_gr = new GlideRecord('sys_ux_app_route');
                            if (route_gr.get(grpage.getValue('route'))) {
                                gs.info('route: ' + route_gr.getValue('route_type'));
                                currentSearchResult.children[0].props_details.link = getURL(route_gr.getValue('route_type'));
                            }
                        }
                    }
                    searchResults.push(currentSearchResult);
                }
            }
        });
        return searchResults;
    } catch (e) {
        return searchResults;
    }

    function getSearchBlockTemplate() {
        var searchCardTemplate = {
            "block_id": "ed61d603eb714110da1861c59c52284e",
            "name": "Search Card",
            "title": "",
            "subtitle": "",
            "order": null,
            "type": {
                "group": "element",
                "name": "Simple card with button",
                "id": "115fe59ceb38011090fa99602a5228b5",
                "route": "simple_card_with_button",
                "props": [{
                    "element": "footer_text",
                    "type": "string"
                }]
            },
            "children": [{
                "block_id": "78b11e03eb714110da1861c59c5228a5",
                "name": "Search view button",
                "title": "view",
                "subtitle": "view123",
                "order": null,
                "type": {
                    "group": "action",
                    "name": "Button",
                    "id": "02c8c279c3e401104b8e88c7c840dde2",
                    "route": "button",
                    "props": [{
                            "element": "action_type",
                            "type": "string"
                        },
                        {
                            "element": "link",
                            "type": "url"
                        },
                        {
                            "element": "event_name",
                            "type": "string"
                        }
                    ]
                },
                "children": [],
                "props_details": {
                    "action_type": "link",
                    "link": "",
                    "event_name": ""
                },
                "pageParams": {}
            }],
            "props_details": {
                "footer_text": ""
            },
            "pageParams": {}
        };
        return searchCardTemplate;
    }

    function getURL(route) {
        var gr = new GlideRecord('sn_ace_app_config');
        var url = '';
        if (gr.get(input.application_id)) {
            url = '/now/' + util.getURLPath(gr.getValue('app_config')) + '/' + route + '/';
        }
        return url;
    }
}
