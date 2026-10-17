var SOWIncidentRouteUtil = Class.create();
    SOWIncidentRouteUtil.prototype = Object.extendsObject(sn_sow.SOWDefaultRecordRouteUtil, {
        PLUGINS: {
            INVESTIGATION_FWK: "com.snc.sn_invest_fwk"
        },
        INVESTIGATE: {
            "route": "investigate",
            "fields": {
                "show": true
            },
            "label": gs.getMessage("Investigation"),
            "options": {}
        },
        initialize: function() {},
        handles: function(table, sysId) {
            return table === "incident";
        },
        getOtherRoutes: function(table, sysId) {
            // for investigation route
            if(sysId == "-1") return;
			
            var gr = new GlideRecord(table);
            if(gr.get(sysId) && gr.isValidRecord() && gr.cmdb_ci == "" && !gr.active) return;
			
            if(!GlidePluginManager.isActive(this.PLUGINS.INVESTIGATION_FWK)) return;
			
            if(new sn_sow.SOWInvestigateConfig().isAnyProviderIntegrated())
                return this.RESULT.routes.push(this.INVESTIGATE);
        },
        type: 'SOWIncidentRouteUtil'
    });
