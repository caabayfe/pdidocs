function transform(input) {
    var aceAppConfigId = input.aceAppConfigId;

    var output = [];
    var CONSTANTS = new sn_ace.ACEAppBuilderMetaData();
    var pageIds = [];
    if (aceAppConfigId) {
        var pageGR = new GlideRecord('sn_ace_page');
        pageGR.addQuery('ace_app', aceAppConfigId);
        pageGR.query();
        while (pageGR.next()) {
            pageIds.push(pageGR.getValue('sys_id'));
        }
    }

    var appId = input.aceAppConfigId;


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
                "route": "record",
                "fields": {
                    "aceAppConfigId": appId,
                    "table": "sn_ace_content_block",
                    "sysId": searchGr.getUniqueValue()
                },
                "params": {},
				reload: true
            };
        }
    } catch (e) {}


    // Get Modules

    var modulesContentBlockQuery = 'document_id=' + aceAppConfigId;
    pageIds.forEach(function(pageId) {
        modulesContentBlockQuery += '^ORdocument_id=' + pageId;
    });
    modulesContentBlockQuery += '^type=76dddbc9c38501104b8e88c7c840dd9f';

    // Get Reusable blocks
    var reusableBlockQuery = 'document_table=sn_ace_app_config^type=5db4a12153975110c733ddeeff7b1277^document_id=' + appId;

    // context.props_details.component_name = 'now-content-tree';
            output = [
            {
                "id": "home",
                "label": gs.getMessage("Home"),
                "icon": "home-outline",
                "navigation": {
                    "route": "/now/ace-app-builder/home",
                    "fields": {},
                    "params": {},
                    reload: true
                }
            },
            {
                "id": "basic-details",
                "label": gs.getMessage("Basic Details"),
                "icon": "window-outline",
                "navigation": {
                    "route": "record",
                    "fields": {
                        "table": "sn_ace_app_config",
                        "sysId": aceAppConfigId,
                        "aceAppConfigId": appId
                    },
                    "params": {},
                    reload: true
                }
            }, {
                "id": "pages",
                "label": gs.getMessage("Pages"),
                "icon": "pencil-page-outline",
                "navigation": {
                    "route": "list",
                    "fields": {
                        "aceAppConfigId": aceAppConfigId,
                        "table": "sn_ace_page"
                    },
                    "params": {
                        "filter": "ace_app=" + aceAppConfigId
                    },
                    reload: true
                }
            }, {

                "id": "content-types",
                "label": gs.getMessage("Content Types"),
                "icon": "folder-open-outline",
                "children": [
                    {
                        "id": "custom-content-types",
                        "label": gs.getMessage("Custom Content Types"),
                        "icon": "folder-open-outline",
                        "navigation": {
                            "route": "list",
                            "fields": {
                                "aceAppConfigId": aceAppConfigId,
                                "table": "sn_ace_content_block_type"
                            },
                            "params": {
                                "filter": "ace_app=" + aceAppConfigId
                            },
                            reload: true
                        }
                    },
                    {
                        "id": "reusable-blocks",
                        "label": gs.getMessage("Reusable Blocks"),
                        "icon": "pencil-page-outline",
                        "url": "/now/ace-app-builder/ace-list-page/" + appId + "/sn_ace_content_block" + "/params/filter/" + reusableBlockQuery,
                        "navigation": {
                            "route": "list",
                            "fields": {
                                "table": "sn_ace_content_block",
                                "aceAppConfigId": appId
                            },
                            "params": {
                                "filter": reusableBlockQuery
                            },
                            reload: true
                        }

                    }
                ]
            }, {
                "id": "modules",
                "label": gs.getMessage("Modules"),
                "icon": "folder-open-outline",
                "navigation": {
                    "route": "list",
                    "fields": {
                        "aceAppConfigId": aceAppConfigId,
                        "table": "sn_ace_content_block"
                    },
                    "params": {
                        "filter": modulesContentBlockQuery
                    },
                    reload: true
                }
            }, {
                "id": "search-configurations",
                "label": gs.getMessage("Search Configurations"),
                "icon": "magnifying-glass-outline",
                "navigation": searchNavigation
            }, {
                "id": "help-content",
                "label": gs.getMessage("Help Content"),
                "icon": "circle-question-outline",
                "navigation": {
                    "route": "list",
                    "fields": {
                        "aceAppConfigId": aceAppConfigId,
                        "table": "sys_embedded_help_content"
                    },
                    "params": {
                        "filter": 'sys_scope=' + pageGR.sys_scope
                    },
                    reload: true
                }
            }
        ];

    return output;
}
