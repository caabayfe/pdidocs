var DashboardMigration = Class.create();
DashboardMigration.prototype = {
    initialize: function() {
        this.layout = {
            "default": {
                "children": null,
                "items": [{
                    "slotName": "Main",
                    "rules": {
                        "grid-area": "main"
                    },
                    "styles": {
                        "display": "flex",
                        "flex-direction": "column"
                    }
                }],
                "root": null,
                "rules": {
                    "grid-template-rows": "minmax(400px,auto)",
                    "grid-template-columns": "1fr",
                    "grid-template-areas": "\"main\"",
                    "grid-gap": "1rem",
                    "height": "100%"
                },
                "styles": null,
                "templateId": "28bde4cd53431010e6bcddeeff7b12cc",
                "type": "grid"
            }
        };
        this.composition = [{
            "elementId": "iframe_1",
            "elementLabel": "Iframe 1",
            "propertyValues": {
                "title": {
                    "type": "JSON_LITERAL",
                    "value": "Wikipedia home page"
                },
                "src": {
                    "type": "JSON_LITERAL",
                    "value": "https://www.wikipedia.com"
                },
                "width": {
                    "type": "JSON_LITERAL",
                    "value": "100%"
                },
                "height": {
                    "type": "JSON_LITERAL",
                    "value": "100vh"
                }
            },
            "eventMappings": [],
            "slot": "Main",
            "definition": {
                "id": "2eda8d95aae6d05a26d94fbf692ac6f9",
                "type": "MACROPONENT"
            },
            "overrides": null,
            "isHidden": {
                "type": "JSON_LITERAL",
                "value": ""
            },
            "isNonDestructive": false,
            "styles": {}
        }];
    },
    migrateDashboardToIframe: function() {
        var dashboardList = this.getAllDashboardInfo();
        for (var i = 0; i < dashboardList.length; i++) {
            var newMCPSysID = this.createDashboard(dashboardList[i].name);
            var gr = new GlideRecord('sys_ux_macroponent');
            gr.get(newMCPSysID);
            gr.setValue('layout', JSON.stringify(this.layout));
            var composition = this.getComposition(dashboardList[i]);
            gr.setValue('composition', JSON.stringify(composition));
            gr.update();
        }
    },
    migrateWidgetToIframe: function() {
        var dashboardList = this.getAllDashboardInfo();
        for (var i = 0; i < dashboardList.length; i++) {

            var newMCPSysID = this.createDashboard(dashboardList[i].name);

            var gr = new GlideRecord('sys_ux_macroponent');
            gr.get(newMCPSysID);

            var dashboardLayoutUtil = new DashboardLayoutUtil(dashboardList[i].sysId);
            var composition = dashboardLayoutUtil.getComposition();
            var layout = dashboardLayoutUtil.getLayout();
			
			gs.log(JSON.stringify(dashboardList[i]));
			gs.log(JSON.stringify(composition));
			gs.log(JSON.stringify(layout));

            gr.setValue('layout', JSON.stringify(layout));
            gr.setValue('composition', JSON.stringify(composition));
            gr.update();
        }
    },
    getComposition: function(dashboard) {
        var composition = this.composition;
        composition[0].propertyValues.src.value = "/$pa_dashboard.do?sysparm_dashboard=" + dashboard.sysId + "&sysparm_header=hidden";
        composition[0].propertyValues.title.value = dashboard.name;
        return composition;
    },
    createDashboard: function(dashboardName) {
        var request = this.getRESTRequest();
        var body = {
            name: dashboardName,
            route: this.getUUID()
        };
        request.setRequestBody(JSON.stringify(body));
        var response = request.execute();
        var newMCPSydId = this.getNewMacromponentSydId(response.getBody(), dashboardName);
        return newMCPSydId;
    },
    getNewMacromponentSydId: function(result, dashboardName) {
        var mcps = JSON.parse(result).result.screen.macroponentInstance.macroponentDefinitions;
        for (var i = 0; i < Object.keys(mcps).length; i++) {
            var key = Object.keys(mcps)[i];
            if (mcps[key].name == dashboardName) return (mcps[key].id);
        }
    },
    getRESTRequest: function() {
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint('http://localhost:8080/api/now/builder/dashboards');// gs.getProperty('glide.servlet.uri') + 
        request.setHttpMethod('POST');
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader('Authorization', 'Basic YWRtaW46YWRtaW4=');
        request.setRequestHeader('Content-Type', 'application/json');
        return request;
    },
    getAllDashboardInfo: function() {
        var gr = new GlideRecord('pa_dashboards');
		//gr.addQuery('sys_id','0b35c80ceb10220078e44d3df106fe61');
        gr.addActiveQuery();
        gr.query();
        var dashboardList = [];
        while (gr.next()) {
            var name = gr.getValue('name');
            var sysId = gr.getUniqueValue();
            dashboardList.push({
                name: name,
                sysId: sysId
            });
        }
        return dashboardList;
    },
    getUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    type: 'DashboardMigration'
};
