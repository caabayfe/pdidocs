var DashboardLayoutUtil = Class.create();
DashboardLayoutUtil.prototype = {
    initialize: function(dashboardSysId) {
        var dashboardMetadataUtils = new DashboardMetadataUtils();
        var dashboardMetadata = dashboardMetadataUtils.getDashboardContent(dashboardSysId);
        var noOfTabs = dashboardMetadata.noOfTabs;
        var widgetList = [];
        for (var i = 0; i < noOfTabs; i++) {
            var tab = dashboardMetadata.tabs[i];
            widgetList = widgetList.concat(tab.widgets);
        }
        gs.log(widgetList);
        this.widgets = widgetList;
    },
    getComposition: function() {
        var composition = [];
        for (var i = 0; i < this.widgets.length; i++) {
            var componentComposition = this.getComponentComposition(i + 1, this.widgets[i]);
            composition.push(componentComposition);
        }
        return composition;
    },
    getComponentComposition: function(number, widget) {
		var portalId = '?sysparm_portal_id='+ widget.portalSectionSysId;
		var widgetId = '&sysparm_widget_id='+ widget.sys_id;
		var title = '&sysparm_title='+ widget.title;
		var urlParams = portalId + widgetId + title;
        return {
            elementId: 'iframe_' + number,
            elementLabel: 'Iframe ' + number,
            propertyValues: {
                title: {
                    type: 'JSON_LITERAL',
                    value: ''
                },
                src: {
                    type: 'JSON_LITERAL',
                    value: '/legacy_widget.do' + urlParams
                },
                width: {
                    type: 'JSON_LITERAL',
                    value: '100%'
                },
                height: {
                    type: 'JSON_LITERAL',
                    value: '400'
                },
                disableSandbox: {
                    "type": "JSON_LITERAL",
                    "value": true
                }
            },
            eventMappings: [],
            slot: 'Row ' + number,
            definition: {
                id: '2eda8d95aae6d05a26d94fbf692ac6f9',
                type: 'MACROPONENT'
            },
            overrides: null,
            isHidden: {
                type: 'JSON_LITERAL',
                value: ''
            },
            isNonDestructive: false,
            styles: {}
        };

    },
    getLayoutItem: function(number) {
        return {
            slotName: 'Row ' + number,
            rules: {
                'grid-area': 'row' + number
            },
            styles: {
                display: 'flex',
                'flex-direction': 'column'
            }
        };
    },
    getLayout: function() {
        var layout = {
            "default": {
                children: null,
                items: [],
                root: null,
                rules: {
                    'grid-template-rows': 'auto',
                    'grid-template-columns': '100%',
                    'grid-template-areas': '',
                    'grid-gap': '1rem',
                    'min-height': '400px',
                    height: '100%'
                },
                styles: null,
                templateId: Math.floor(Math.random() * 1000000000).toString(),
                type: 'grid'
            },
        };
        var areas = [];

        for (var i = 1; i <= this.widgets.length; i++) {
            layout["default"].items.push(this.getLayoutItem(i));
            areas.push('"row' + i + '"');
        }
        layout["default"].rules['grid-template-areas'] = areas.join(' ');
        return layout;
    },
    type: 'DashboardLayoutUtil'
};
