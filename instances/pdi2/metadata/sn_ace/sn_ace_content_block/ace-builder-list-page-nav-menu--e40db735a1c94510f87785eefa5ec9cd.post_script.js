(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */

    var CONSTANTS = new sn_ace.ACEAppBuilderMetaData();
    var pageIds = [];
    if (context.pageParams.aceAppConfigId) {
        var pageGR = new GlideRecord('sn_ace_page');
        pageGR.addQuery('ace_app', context.pageParams.aceAppConfigId);
        pageGR.query();
        while (pageGR.next()) {
            pageIds.push(pageGR.getValue('sys_id'));
        }
    }

    var appId = context.pageParams.aceAppConfigId;


    // Get search config Content block ID
    var searchNavigation = {};
    try {
        var searchGr = new GlideRecord('sn_ace_content_block');
        searchGr.addQuery('document_table', 'sn_ace_app_config');
        searchGr.addQuery('document_id', appId);
        searchGr.addQuery('type', CONSTANTS.CONTENT_BLOCK_TYPES.SEARCH_CONFIG);
        searchGr.query();
        if (searchGr.next()) {
            searchNavigation = {
                "route": "ace-record-page",
                "fields": {
                    "aceAppConfigId": appId,
                    "table": "sn_ace_content_block",
                    "sysId": searchGr.getUniqueValue()
                },
                "params": {}
            };
        }
    } catch (e) {}


    // Get Modules

    var modulesContentBlockQuery = 'document_id=' + context.pageParams.aceAppConfigId;
    pageIds.forEach(function(pageId) {
        modulesContentBlockQuery += '^ORdocument_id=' + pageId;
    });
    modulesContentBlockQuery += '^type=76dddbc9c38501104b8e88c7c840dd9f';

    // Get Reusable blocks
    var reusableBlockQuery = 'document_table=sn_ace_app_config^type=5db4a12153975110c733ddeeff7b1277^document_id=' + appId;

    context.props_details.component_name = 'now-content-tree';
    context.props_details.component_properties = {
        items: [{
            "id": "basic-details",
            "label": "Basic Details",
            "icon": "window-outline",
            "url": "/now/ace-app-builder/ace-record-page/" + appId + "/sn_ace_app_config/" + context.pageParams.aceAppConfigId
        }, {
            "id": "pages",
            "label": "Pages",
            "icon": "pencil-page-outline",
            "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sn_ace_page" + "/params/filter/ace_app=" + context.pageParams.aceAppConfigId
        }, {
            "id": "content-types",
            "label": "Content Types",
            "icon": "folder-open-outline",
            "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sn_ace_content_block_type" + "/params/filter/ace_app=" + context.pageParams.aceAppConfigId
        }, {
            "id": "modules",
            "label": "Modules",
            "icon": "folder-open-outline",
            "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sn_ace_content_block" + "/params/filter/" + modulesContentBlockQuery,
        }, {
            "id": "search-configurations",
            "label": "Search Configurations",
            "icon": "magnifying-glass-outline",
            "url": "/now/ace-app-builder/ace-record-page/" + appId + "/sn_ace_content_block/" + searchGr.getUniqueValue(),
        }, {
            "id": "help-content",
            "label": "Help Content",
            "icon": "circle-question-outline",
            "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sys_embedded_help_content" + "/params/filter/sys_scope=" + pageGR.sys_scope,
        }, {
            "id": "reusable-blocks",
            "label": "Reusable Blocks",
            "icon": "pencil-page-outline",
            "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sn_ace_content_block" + "/params/filter/" + reusableBlockQuery,
        }]
    };
    context.props_details.events_data = {
        "NOW_CONTENT_TREE#ITEM_CLICKED": {
            "handler": {
                "name": "NAVIGATE_TO_URL",
                "url": "${item.url}"
            }
        }
    };
})(context, pageParams);
