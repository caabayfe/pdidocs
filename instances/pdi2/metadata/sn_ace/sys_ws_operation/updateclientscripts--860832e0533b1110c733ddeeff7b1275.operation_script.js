(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
	var result = [];
	var pageComposition = {};
	var globalUtil = new global.ACEAppBuilderGlobalScopedUtil();
	var ACE_UTIL_CLIENT_SCRIPT_INCLUDE_ID = '457b82c753b061104410ddeeff7b12e6';
	var ACE_CONTENT_MANAGER_ID = 'db78b1b67e04495772a27dc5abc80a49';
	var ACE_CONTET_MANAGER_PRESET_ID = '7ff90b977143a110f877d65dc8b01747';

	var getGUID = function() {
		return 'xxxx-xxxx-yyyyyy-xxxx-yyyyxxyy'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}
    var updateMacroponentComposition = function(eventMappingId, clientScriptSysIds) {
        var macroponentEventMapping = [];
        if (clientScriptSysIds && clientScriptSysIds.length > 0) {

            clientScriptSysIds.forEach(function(sysId) {
                macroponentEventMapping.push({
                    "eventMappingId": eventMappingId,
                    "sourceEventApiName": "sn_ace.ACE_ACTION_PERFORMED",
                    "sourceEventDefinition": {
                        "apiName": "sn_ace.ACE_ACTION_PERFORMED",
                        "id": null,
                        "type": "UXEVENT"
                    },
                    "targets": [{
                        "broker": null,
                        "clientScript": {
                            "sysId": sysId
                        },
                        "targetId": getGUID(),
                        "type": "CLIENT_SCRIPT"
                    }]
                });

            });
            return macroponentEventMapping;

        }

    };



	// If there's no payload and no query parameter we can return an error.
	if (global.JSUtil.isEmpty(payload))
		return new sn_ws_err.BadRequestError("No Query String provided");

	if (payload.clientScripts && payload.pageId) {
		var allClientScriptIds = [];

		var allCSGr = new GlideRecord("sys_ux_client_script");
		allCSGr.addQuery("macroponent", payload.pageId);
		allCSGr.query();
		while(allCSGr.next()) {
			allClientScriptIds.push({sysId: allCSGr.getUniqueValue(), name: allCSGr.getValue("name"), script: allCSGr.getValue("script"), includes: allCSGr.getValue("includes")});
		}
		var clientScriptIds = [];
		var clientScriptData = {};
		var aceWatchScripts = [];
		payload.clientScripts.forEach(function(clientScriptItem) {
			clientScriptIds.push(clientScriptItem.sysId);
			clientScriptData[clientScriptItem.sysId] = { script: clientScriptItem.script, name: clientScriptItem.name, watcher: clientScriptItem.watcher };
		});
		var visitedClientScriptIds = [];
		var gr = new GlideRecord("sys_ux_client_script");
		gr.addQuery("sys_id", "IN", clientScriptIds);
		gr.query();
		while(gr.next()) {
			visitedClientScriptIds.push(gr.getUniqueValue());
			globalUtil.updateRecord("sys_ux_client_script", gr.getUniqueValue(), {
				name: clientScriptData[gr.getUniqueValue()].name,
				script: clientScriptData[gr.getUniqueValue()].script
			});
			if(clientScriptData[gr.getUniqueValue()].watcher) {
				aceWatchScripts.push(gr.getUniqueValue());
			}
		}
		var remainingClientScriptIdsToAdd = clientScriptIds.filter( function(csItem) { return visitedClientScriptIds.indexOf(csItem) == -1; });
		remainingClientScriptIdsToAdd.forEach(function(clientScriptItemId) {
			clientScriptItem = clientScriptData[clientScriptItemId];
			if(clientScriptItem.name) {
				var csId = globalUtil._grRecordCreator("sys_ux_client_script", {
					name: clientScriptItem.name,
					script: clientScriptItem.script,
					macroponent: payload.pageId,
					includes: ACE_UTIL_CLIENT_SCRIPT_INCLUDE_ID
				});
				if(clientScriptItem.watcher) {
					aceWatchScripts.push(csId);
				}
			}
		});
		var remainingClientScriptIdsToRemove = allClientScriptIds.filter( function(csItem) { return clientScriptIds.indexOf(csItem) == -1; });
		var csToRemoveGr = new GlideRecord("sys_ux_client_script");
		csToRemoveGr.addQuery("sys_id", "IN", remainingClientScriptIdsToRemove);
		csToRemoveGr.query();
		while(csToRemoveGr.next()) {
			globalUtil.deleteRecord("sys_ux_client_script", csToRemoveGr.getUniqueValue());
		}

		var acePageGr = new GlideRecord("sn_ace_page");
		acePageGr.get(payload.acePageId);
		if(acePageGr.isValid()) {
			acePageGr.client_scripts = aceWatchScripts.join(",");
			acePageGr.update();
		}
	}

	var pageGr = new GlideRecord("sys_ux_macroponent");
	pageGr.get(payload.pageId);
	var internalEventMappings = {};
	if(pageGr.isValid()) {
		pageComposition = JSON.parse(pageGr.getValue("composition"));
		internalEventMappings = pageGr.getValue("internal_event_mappings");
		internalEventMappings = JSON.parse(internalEventMappings);
		internalEventMappings["sn_ace.ACE_ACTION_PERFORMED"] = [];
	}
	var aceEventMapValue = [];
	var csGr = new GlideRecord("sys_ux_client_script");
	csGr.addQuery("macroponent", payload.pageId);
	csGr.query();
	while(csGr.next()) {
		var scriptWatcherValue = aceWatchScripts.indexOf(csGr.getUniqueValue()) > -1;
		if(scriptWatcherValue || csGr.getValue("name") == "beforePageLoad" || csGr.getValue("name") == "beforePageLoadV3") {
			result.push({sysId: csGr.getUniqueValue(), name: csGr.getValue("name"), script: csGr.getValue("script"), includes: csGr.getValue("includes"), watcher: scriptWatcherValue});
		}
		if(scriptWatcherValue) {
			aceEventMapValue.push({
				"broker" : null,
				"clientScript": {
					"sysId" : csGr.getUniqueValue()
				},
				"conditional" : null,
				"declarativeAction" : null,
				"event" : null,
				"operation" : null,
				"targetId": getGUID(),
				"type" : "CLIENT_SCRIPT"
			});
		}
	}
	internalEventMappings["sn_ace.ACE_ACTION_PERFORMED"] = aceEventMapValue;
	globalUtil.updateRecord("sys_ux_macroponent", payload.pageId, {
		internal_event_mappings: JSON.stringify(internalEventMappings, null, "\t")
	});

    // preset and controller changes
    if (pageComposition.length > 0) {
        pageComposition.forEach(function(composition, compositionIndex) {
            if (composition && composition.definition.id == ACE_CONTENT_MANAGER_ID) {
                if (composition.preset && composition.preset.id == ACE_CONTET_MANAGER_PRESET_ID) {
					composition['eventMappings'] = updateMacroponentComposition(gs.generateGUID(), aceWatchScripts);
					pageComposition[compositionIndex] = composition;
                    globalUtil.updateRecord("sys_ux_macroponent", payload.pageId, {
                        composition: JSON.stringify(pageComposition, null, "\t")
                    });
                }

            }
        });




    }


    response.setBody(result);
})(request, response);
