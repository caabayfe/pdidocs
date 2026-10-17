function transform(input) {
    var TRANSLATIONS = {
        NO_BUSINESS_CRITICALITY: gs.getMessage("No Business Criticality"),
        MOST_CRITICAL: gs.getMessage("Most Critical"),
        SOMEWHAT_CRITICAL: gs.getMessage("Somewhat Critical"),
        LESS_CRITICAL: gs.getMessage("Less Critical"),
        NOT_CRITICAL: gs.getMessage("Not Critical"),
        OWNER: gs.getMessage("Owner"),
        CLASS: gs.getMessage("Class"),
        DISCOVERY_SOURCE: gs.getMessage("Discovery source"),
        LAST_DISCOVERED: gs.getMessage("Last discovered"),
        NONE: gs.getMessage("none"),
        NO_OP_STATUS: gs.getMessage("No status found")
    };
    var BUSINESS_CRITICALITY_VALUES = {
        MOST_CRITICAL: '1 - most critical',
        SOMEWHAT_CRITICAL: '2 - somewhat critical',
        LESS_CRITICAL: '3 - less critical',
        NOT_CRITICAL: '4 - not critical'
    };
    var COLORS = {
        NO_CRITICALITY_GREY: "low",
        CRITICAL_RED: "critical",
        HIGH_ORANGE: "high",
        WARN_YELLOW: "warning",
        LOW_BLUE: "info",
        DEFAULT: "moderate",
    };
    // format the highlight object for criticality
    function getBusinessCriticality(businessCriticality) {
        var bcHighlightObject;
        if (!businessCriticality) {
            bcHighlightObject = {
                "label": TRANSLATIONS.NO_BUSINESS_CRITICALITY,
                "color": COLORS.NO_CRITICALITY_GREY
            };
            return bcHighlightObject;
        }
        switch (businessCriticality) {
            case BUSINESS_CRITICALITY_VALUES.MOST_CRITICAL:
                bcHighlightObject = {
                    "label": TRANSLATIONS.MOST_CRITICAL,
                    "color": COLORS.CRITICAL_RED
                };
                break;
            case BUSINESS_CRITICALITY_VALUES.SOMEWHAT_CRITICAL:
                bcHighlightObject = {
                    "label": TRANSLATIONS.SOMEWHAT_CRITICAL,
                    "color": COLORS.HIGH_ORANGE
                };
                break;
            case BUSINESS_CRITICALITY_VALUES.LESS_CRITICAL:
                bcHighlightObject = {
                    "label": TRANSLATIONS.LESS_CRITICAL,
                    "color": COLORS.WARN_YELLOW
                };
                break;
            case BUSINESS_CRITICALITY_VALUES.NOT_CRITICAL:
                bcHighlightObject = {
                    "label": TRANSLATIONS.NOT_CRITICAL,
                    "color": COLORS.LOW_BLUE
                };
                break;
            default:
                bcHighlightObject = {
                    "label": businessCriticality,
                    "color": COLORS.DEFAULT
                };
                break;
        }
        return bcHighlightObject;
    }
    // get the searchable properties for the object
    function getPropertiesObject(gr) {
        return {
            "name": gr.getDisplayValue("name"),
            "owned_by": gr.getDisplayValue("owned_by"),
            "last_discovered": gr.getDisplayValue("last_discovered"),
            "class": gr.getValue("sys_class_name"),
            "tableName": gr.getDisplayValue("sys_class_name"),
            "discovery_source": gr.getDisplayValue("discovery_source"),
            "operational_status": gr.getDisplayValue("operational_status"),
            "busines_criticality": gr.getDisplayValue("busines_criticality"),
            "card_name": gs.getMessage("{0} application service card", gr.getDisplayValue("name"))
        };
    }
    var appServiceArray = [];
    var sysIds = input.ciSysIds;
    var mapService = new UnifiedMapHelper();
    // this is an object where the key is the CI and the values are an array of sys_id of application service
    var relatedSvcSysIds = mapService.getRelatedApplicationServices(!Array.isArray(sysIds) ? [sysIds] : sysIds);
    if (!relatedSvcSysIds.success || !relatedSvcSysIds.result) {
        // error condition, display error on client
        return relatedSvcSysIds;
    }
    var visitedServiceSysIds = {};
    var keys = Object.keys(relatedSvcSysIds.result);
    for (var index = 0; index < keys.length; index++) {
        // iterate through results and grab all associated services. 
        // The key is the sys_id of the CI and the value is an array of service CIs
        var serviceSysIds = relatedSvcSysIds.result[keys[index]];
        if (!serviceSysIds || serviceSysIds.length === 0)
            continue;
        var serviceGr = new GlideRecord('cmdb_ci_service_auto');
        serviceGr.addQuery('sys_id', 'IN', serviceSysIds);
        serviceGr.query();
        while (serviceGr.next()) {
            var sysId = serviceGr.getUniqueValue();
            // ensure no duplicates
            if (visitedServiceSysIds.hasOwnProperty(sysId)) {
                continue;
            }
            visitedServiceSysIds[sysId] = "";
            // constructs the application services card from properties
            var propertiesObj = getPropertiesObject(serviceGr);
            var cardContent = {};
            cardContent.sysId = sysId;
            cardContent.header = {
                "label": propertiesObj["name"],
                "size": "md"
            };
            cardContent.subheader = {
                "label": propertiesObj['tableName']
            };
            // label value stacked will be split into two rows
            cardContent.labelValueStackedRow1 = [{
                    "label": TRANSLATIONS.OWNER,
                    "value": {
                        "type": "string",
                        "value": propertiesObj["owned_by"] || TRANSLATIONS.NONE
                    }
                },
                {
                    "label": TRANSLATIONS.CLASS,
                    "value": {
                        "type": "string",
                        "value": propertiesObj["class"]
                    }
                }
            ];
            cardContent.labelValueStackedRow2 = [{
                    "label": TRANSLATIONS.DISCOVERY_SOURCE,
                    "value": {
                        "type": "string",
                        "value": propertiesObj["discovery_source"] || TRANSLATIONS.NONE
                    }
                },
                {
                    "label": TRANSLATIONS.LAST_DISCOVERED,
                    "value": {
                        "type": "string",
                        "value": propertiesObj["last_discovered"] || TRANSLATIONS.NONE
                    }
                }
            ];
            var opStatus = propertiesObj["operational_status"];
            cardContent.operationalLabel = opStatus || TRANSLATIONS.NO_OP_STATUS;
            cardContent.businessCriticality = getBusinessCriticality(propertiesObj["busines_criticality"]);
            // copy properties to card so they can be searched
            cardContent.properties = propertiesObj;

			// add a prop to indicate which supplied CIs are in each app svc
			var suppliedSysIdsInSvc = [];
			keys.forEach(function(key){
				if (relatedSvcSysIds.result[key].indexOf(sysId) > -1) {
					suppliedSysIdsInSvc.push(key);
				}
			});
			cardContent.sysIdsInSvc = suppliedSysIdsInSvc;

            appServiceArray.push(cardContent);
        }
    }
    result = {
        "appServiceArray": appServiceArray
    };
    return result;
}
