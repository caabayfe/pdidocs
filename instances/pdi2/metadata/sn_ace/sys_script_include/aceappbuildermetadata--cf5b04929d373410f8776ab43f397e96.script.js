var ACEAppBuilderMetaData = Class.create();
ACEAppBuilderMetaData.prototype = {
    initialize: function() {},
    BASE_UXF_RECORDS: {
        DEFAULT_PARENT_APP: '9d457929eb64011090fa99602a5228fb',
        DEFAULT_APP_SHELL_UI: 'f159bde9eb64011090fa99602a5228cc',
        APP_SHELLS: [{
                name: 'ACE Base App Shell',
                id: 'f159bde9eb64011090fa99602a5228cc',
                parentApp: '9d457929eb64011090fa99602a5228fb'
            },
            {
                name: 'ACE Unified Nav App Shell',
                id: '7045b717532d411033cdddeeff7b1275',
                parentApp: 'c86a62e2c7022010099a308dc7c26022'
            }
        ],
        ACE_BASE_EXPERIENCE_APP_CONFIG: 'caa40265eba4011090fa99602a52285a',
        HOME_PAGE: {
            ROUTE: '03f929b9eb20011090fa99602a5228d5',
            MACROPONENT: 'f6f929b9eb20011090fa99602a5228bd',
            SCREEN: 'b6f929b9eb20011090fa99602a5228c0',
            SCREEN_TYPE: 'eef9ed79eb20011090fa99602a52280d'
        },
        SETTINGS_PAGE: {
            ROUTE: '55be26b5eb24011090fa99602a522867',
            MACROPONENT: '4dbe26b5eb24011090fa99602a522861',
            SCREEN: '9dbe26b5eb24011090fa99602a522863',
            SCREEN_TYPE: 'c9be62b5eb24011090fa99602a52285a'
        },
        BLANK_PAGE: {
            ROUTE: '249cb01b87bc0110a4a2c077f6cb0b94',
            MACROPONENT: '149cb01b87bc0110a4a2c077f6cb0b8e',
            SCREEN: '989cb01b87bc0110a4a2c077f6cb0b90',
            SCREEN_TYPE: '109cb01b87bc0110a4a2c077f6cb0b8a'
        },
        CONTENT_BLOCK: {
            ROUTE: '8b7c9a88ebf0011090fa99602a5228d1',
            MACROPONENT: '244ef37553a101102958ddeeff7b1208',
            SCREEN: 'ec4ef37553a101102958ddeeff7b120a',
            SCREEN_TYPE: 'e84ef37553a101102958ddeeff7b1203'
        },
        LIST_PAGE: {
            ROUTE: '4fa5dab487510110a4a2c077f6cb0bae',
            MACROPONENT: '5aa59ab487510110a4a2c077f6cb0b1e',
            SCREEN: '10fc0c7f87c10110a4a2c077f6cb0b82',
            SCREEN_TYPE: '5aa59ab487510110a4a2c077f6cb0b1a'
        },
        RECORD_PAGE: {
            ROUTE: '8b25ec7887d54110a4a2c077f6cb0bc3',
            MACROPONENT: 'fa156c7887d54110a4a2c077f6cb0b84',
            SCREEN: '0f156c7887d54110a4a2c077f6cb0b86',
            SCREEN_TYPE: 'fe156c7887d54110a4a2c077f6cb0b80'
        },
        SEARCH: {
            ROUTE: '7da24a026b510110da18ec188e44af97',
            MACROPONENT: '61a24a026b510110da18ec188e44af90',
            SCREEN: 'e1a24a026b510110da18ec188e44af93',
            SCREEN_TYPE: 'a5a2c6026b510110da18ec188e44afcb'
        },
        SECTIONS_DATA_BROKER_NAME: 'ace_fetch_content_blocks',
		ACE_PAGE_INIT_DATA_BROKER_NAME: 'getacepageinitialdata',
		ACE_CONFIG_DEFAULT_CONTROLLER: 'ace_default_controller_1'

    },
    ACE_BASE_EXPERIENCE_CONFIG_ID: 'f0d91c8a87650110a4a2c077f6cb0b3e',
    ACE_CONTENT_MANAGER_ID: 'db78b1b67e04495772a27dc5abc80a49',
    SEARCH_PAGE_NAME: 'Search',
    SEARCH_CONTENT_BLOCK: 'Search Config',
    BLANK_TEMPLATE_NAME: 'BlankTemplate',
	BLANK_TEMPLATE_V2_NAME: 'BlankTemplateV2',
    UXF_TABLES: {
        'MACROPONENT': 'sys_ux_macroponent',
        'SCREEN_TYPE': 'sys_ux_screen_type',
        'APP_ROUTE': 'sys_ux_app_route',
        'SCREEN': 'sys_ux_screen',
        'CLIENT_SCRIPT': 'sys_ux_client_script',
        'APP_CONFIG': 'sys_ux_app_config',
        'PAGE_REGISTRY': 'sys_ux_page_registry',
        'PAGE_PPROPERTY': 'sys_ux_page_property'
    },
    TABLES: {
        'APP_CONFIG': 'sn_ace_app_config',
        'PAGE': 'sn_ace_page',
        'CONTENT_BLOCK': 'sn_ace_content_block',
        'TYPE': 'sn_ace_content_block_type',
        'VARIABLE': 'sn_ace_variable',
		'CONTENT_BLOCK_CONTEXT': 'sn_ace_content_block_context'
    },
    AIS: {
        'searchIndex': 'bec51d0b6b550110da18ec188e44afd9',
        'source': ' ' + 'source',
        'profile': ' ' + 'profile',
        'application': ' ' + 'application',
        'evam_config': '80eb579d53671010968addeeff7b1215'
    },
    CONTENT_BLOCK_TYPES: {
        'MODULE': '76dddbc9c38501104b8e88c7c840dd9f',
        'NAV': '9ffd5fc9c38501104b8e88c7c840ddb8',
        'SEARCH_CONFIG': '9b2e3d0e6b110110da18ec188e44af13',
        'SEARCH_CONTEXT': 'bd61c52f6b650110da18ec188e44af12'
    },
    CLONE_FIELDS: {
        MACROPONENT: [
            'category',
            'composition',
            'data',
            'extends',
            'layout',
            'name',
            'required_translations',
            'root_component_config',
            'props',
            'state_properties',
            'internal_event_mappings',
            'dispatched_events',
            'handled_events'
        ],
        UX_SCREEN: [
            'event_mappings',
            'macroponent_config',
            'name',
            'parent_macroponent',
            'order',
            'required_translations'
        ],
        APP_ROUTE: [
            'name',
            'order',
            'parent_macroponent',
            'route_type',
            'fields',
            'optional_parameters'
        ],
        SCREEN_TYPE: [
            'name'
        ]

    },
    CLONE_ROUTES: ['dynamic-container', 'ace-tab-set', 'card_content', 'simple_card_with_button', 'flex-col-section', 'accordion', 'stepper', 'dynamic-layout-container', 'interactive-cards-list', 'interactive-custom-content-card', 'dynamic-cards-list', 'dynamic-cards-list-item'],
    DEFAULT_CONTENT_BLOCKS: [{
        "name": 'Page Header BreadCrumbs',
        "title": '',
        "subtitle": '',
        "order": "10",
        "type": {
            "name": 'BreadCrumbs',
            "id": '9f3b9c0187410110a4a2c077f6cb0bd3'
        },
        "children": []
    }],
    DEFAULT_PAGES: [{
            'name': 'Home',
            'template': 'Home',
            'path': 'home'
        },
        {
            'name': 'Settings',
            'template': 'Settings',
            'path': 'settings'
        },
        {
            'name': 'ACEList',
            'template': 'List',
            'path': 'aceList'
        },
        {
            'name': 'ACERecord',
            'template': 'Record',
            'path': 'aceRecord'
        },
    ],
    POST_SCRIPT: '(function(context) {\n    /*\n    \t\'name\': @String,\n    \t\'title\': @String,\n    \t\'subtitle\': @String,\n    \t\'cards\': @Array\n    */\n    var polaris = gs.getProperty("x_snc_aceframework.ace.enable.new_web_client", false);\n    if (polaris == \'true\') {\n        context.name = "Welcome to Servicenow\'s New UI";\n        context.title = "New UI in Servicenow !!";\n        context.subtitle = "Servicenow re-designed. Get your hands on !!";\n        var polarisExpCard = {\n            "screens": [{\n                "screen_type": "content",\n                "title": "New Web Client",\n                "heading": "New Web Client Experience",\n                "description": "This is Servicenow redesigned. Welcome to the the New Web Client Experience",\n                "image_src": "/images/ci_landingexp_topicrecommendations.png",\n                "pluginId": "",\n                "actions": [{\n                    "name": "Card Action 1",\n                    "type": "link",\n                    "link": "/navpage.do",\n                    "label": "Configure It",\n                    "external": false\n                }]\n            }]\n        };\n\t\tcontext.cards.push(polarisExpCard);\n    }\n\n})(context);',
    CHROME_HEADER_VALUE: {
        "privatePage": {
            "notificationsEnabled": true,
            "searchEnabled": false,
            "userPrefsEnabled": true,
            "contextualConfigurationItems": {
                "enabled": false
            },
            "globalTools": {
                "collapsingMenuId": 0,
                "primaryItems": [{
                    "label": "UserMenu",
                    "icon": "user",
                    "type": "menu",
                    "primaryDisplay": "icon",
                    "value": {
                        "children": [{
                            "label": "Logout",
                            "position": 500,
                            "type": "navigation",
                            "value": {
                                "value": {
                                    "href": "/logout.do"
                                },
                                "type": "external"
                            }
                        }]
                    }
                }]
            }
        },
        "publicPage": {
            "actionButtons": [],
            "notificationsEnabled": false,
            "searchEnabled": false,
            "userPrefsEnabled": false,
            "menuEnabled": false
        }
    },
    SUPPORTED_PROPERTIES_TYPES: ['boolean', 'integer', 'string', 'short_string', 'choicelist'],
    BLANK_POST_SCRIPTS: ['(function(context, pageParams, blockcontext, dataParams){\n\t// write code here\n})(context, pageParams, blockcontext, dataParams);','(function(context, pageParams, blockcontext, dataParams){\n\t// post script - write code here\n})(context, pageParams, blockcontext, dataParams);'],
    process: function() {
        return ['sn_ace_app_config', 'sn_ace_page', "sn_ace_content_block"];
    },
	UNUSED_PAGES_LIST: ['Overview','Explore Page', 'BlankTemplate', 'BlankTemplateV3', 'DefaultConsoleTemplate', 'Home','Settings','List','Record'],
	SIDE_NAV_TYPE : '9ffd5fc9c38501104b8e88c7c840ddb8',
	MODULE_ITEM_TYPE : '76dddbc9c38501104b8e88c7c840dd9f',

    type: 'ACEAppBuilderMetaData'
};
