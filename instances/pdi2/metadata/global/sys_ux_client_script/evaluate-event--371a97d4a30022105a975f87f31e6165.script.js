/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let useraccountScope = api.data.get_auth_scopes_and_api_for_oauth_entity_1.output.useraccountScope;
    if(event.elementId == "select_1") {
        var scopesInRepeater = api.state.scopesInRepeater;
        var r = api.state.repeaterData;
        if(scopesInRepeater[event.payload.item.sys_id]!=undefined && (scopesInRepeater[event.payload.item.sys_id] != event.context.item.value.id)) {
            // error out, scope already selected
            updateAlert("authscope");
            for(var i in r) {
                if(r[i]["id"] == event.context.item.value.id) {
                    delete scopesInRepeater[r[i]["selectedScope"]];
                    r[i]["selectedScope"] = "";
                    break;
                }
            }
            api.setState('disableAddNewRow', true);
        } else {
            updateAlert("hide");
            scopesInRepeater[event.payload.item.sys_id] = event.context.item.value.id;
            
            for(var i in r) {
                if(r[i]["id"] == event.context.item.value.id) {
                    delete scopesInRepeater[r[i]["selectedScope"]];
                    r[i]["selectedScope"] = event.payload.item.sys_id;
                    var scopesAndAPIsInDB = api.data.get_auth_scopes_and_api_for_oauth_entity_1.output;
                    var apisForScope = scopesAndAPIsInDB["apis"][event.payload.item.sys_id] ? scopesAndAPIsInDB["apis"][event.payload.item.sys_id] : [];
                    r[i]["selectedAPIs"] = apisForScope;
                    var apisInRepeater = api.state.apisInRepeater;
                    for(var apiIndex in apisForScope)
                        apisInRepeater[apisForScope[apiIndex]["id"]] = event.context.item.value.id;
                    break;
                }
            }
            var availableAuthScope = api.state.availableAuthScope;
            if(r.length < availableAuthScope.length) {
                if(Object.values(scopesInRepeater).length == r.length)
                    api.setState('disableAddNewRow', false);
            } // no use of adding rows
        }

        api.emit("SCOPE_AND_APIS_CHANGED", {"scopesAndAPIs": {...r}, "onLoad": "false"});
        if(api.state.scopesInRepeater[useraccountScope] == null || api.state.scopesInRepeater[useraccountScope] == undefined) {
            // Check if we previously had the useraccount scope and no longer do because it was changed away
            if (api.state.useraccountInRepeater) {
                api.setState('scopeRestrictionStatusRecommendationDisabled', 'restricted');
                api.emit("SCOPE_RESTRICTION_STATUS_CHANGED", {"scope_restriction_status": true});
            }
            api.setState("useraccountInRepeater", false);
        } else
            api.setState("useraccountInRepeater", true);

    } else if(event.elementId == "button_1") {
        var r = api.state.repeaterData;
        var scopesInRepeater = api.state.scopesInRepeater;
        var apisInRepeater = api.state.apisInRepeater;
        var ans = [];
        for(var i in r) {
            if(r[i]["id"] != event.context.item.value.id) {
                ans.push({"id" : r[i]["id"], "selectedScope": r[i]["selectedScope"], "selectedAPIs": r[i]["selectedAPIs"]});
            } else {
                if(r[i]["selectedScope"] == useraccountScope) {
                    api.setState('scopeRestrictionStatusRecommendationDisabled', 'restricted');
                    api.emit("SCOPE_RESTRICTION_STATUS_CHANGED", {"scope_restriction_status": true});
                }
                delete scopesInRepeater[r[i]["selectedScope"]];
                for(let apiIndex in r[i]["selectedAPIs"]) {
                    delete apisInRepeater[r[i]["selectedAPIs"][apiIndex]["id"]];
                }
            }
        }
        api.setState('repeaterData', ans);
        api.setState('disableAddNewRow', false);
        api.emit("SCOPE_AND_APIS_CHANGED", {"scopesAndAPIs": {...ans}, "onLoad": "false"});
        if(api.state.scopesInRepeater[useraccountScope] == null || api.state.scopesInRepeater[useraccountScope] == undefined)
            api.setState("useraccountInRepeater", false);
        else 
            api.setState("useraccountInRepeater", true);
    } else if(event.elementId == "apis" && event.name == "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET") {
        var apisInRepeater = api.state.apisInRepeater;
        
        var existingAPIs = [];
        for(let apiInRepeater in apisInRepeater) {
            if(apisInRepeater[apiInRepeater] == event.context.item.value.id) {
                existingAPIs.push(apiInRepeater);
            }
        }

        var newAPIs = [];
        //event.payload.value is an array of objects with attribute id (API), label, path, sys_id
        for(let index in event.payload.value) {
            newAPIs.push(event.payload.value[index]["id"]);
        }

        var toDelete = existingAPIs.filter(x => !newAPIs.includes(x));
        for(let index in toDelete) {
            delete apisInRepeater[toDelete[index]];
        }

        var r = api.state.repeaterData;
        //Get all the rest api and auth scope mapping
        var apiAuthScopeMap = api.data.get_all_rest_api_auth_scope_map_1.output;
        //Get all the scopes and API for the oauth entity
        var scopesInRepeater = api.state.scopesInRepeater;
        var availableAuthScope = api.state.availableAuthScope;
        var existingScopeNameForAPI;
        var showAlert = false; //scenario 1
        var apiMappedAlreadyToAScopeAlert = false; //scenario 2

        /**
         * Validation when user selects APIs for a scope in the repeater/scope section.
         *
         * Two scenarios to validate:
         *
         * Scenario 1: API is already assigned to another row in the current repeater
         *   - Show alert and prevent assignment
         *
         * Scenario 2: API has an existing scope mapping in the global mapping table (sys_rest_api_auth_scope_mapping)
         *   Case A: The existing scope IS already mapped to this OAuth entity
         *           → Allow reassignment (user is moving API from one mapped scope to another)
         *   Case B: The existing scope IS NOT mapped to this OAuth entity
         *           → Block reassignment and show alert (would create conflicting mappings)
         *
         * Example for Scenario 2:
         *   - Table API requires scopeA (mapping exists for Table API to scopeA in sys_api_access_scope)
         *   - User creates a new client / updates existing client and tries to assign Table API for ScopeB
         *   - If scopeA is already mapped for this client (oauth_entity_auth_scope_mapping) → Allow (Case A)
         *   - If scopeA is not mapped for this client (oauth_entity_auth_scope_mapping) → Block (Case B)
         */
        for(let apiIndex in event.payload.value) {
            var apiName = event.payload.value[apiIndex]["id"];
            var existingScopeForAPI = apiAuthScopeMap[apiName]; // scope already assigned to the API (in table)

            // Scenario 1: Check if API is already assigned to a different row in the repeater
            if(apisInRepeater[apiName]!=undefined && (apisInRepeater[apiName] != event.context.item.value.id)) {
                showAlert=true; //scenario 1
                 //If the API is not mapped in table (just assigned in form) apiAuthScopeMap will not have any entry.
                if (!existingScopeForAPI) {
                    existingScopeForAPI = api.state.repeaterData.find(data => data.id == apisInRepeater[apiName]).selectedScope;
                }
                existingScopeNameForAPI = availableAuthScope.find(scope => scope.id == existingScopeForAPI).label;
                break;
            }

            // Scenario 2: Check if API has an existing scope mapping that differs from current selection
            // check if the selected scope for the API is the existing scope (in the db).
            var scopeInDBIsNotTheSelectedScope = existingScopeForAPI != undefined &&
                                                existingScopeForAPI != event.context.item.value.selectedScope;

            if (scopeInDBIsNotTheSelectedScope) {
                //check if the existing scope for the API is already mapped to the entity.
                var isExistingScopeForAPIMappedToEntity = scopesInRepeater[existingScopeForAPI] != undefined;
                // Case B: Existing scope is NOT mapped to entity → Block reassignment
                if (!isExistingScopeForAPIMappedToEntity) {
                    apiMappedAlreadyToAScopeAlert = true;
                    existingScopeNameForAPI = availableAuthScope.find(scope => scope.id == existingScopeForAPI).label;
                    break;
                }
                //(else) Case A: Existing scope IS mapped to entity → Allow reassignment (no alert)
            }
         }

        if(showAlert || apiMappedAlreadyToAScopeAlert) {
                updateAlert("apis", existingScopeNameForAPI);
                api.setState('repeaterData', r);
        } else {
            updateAlert("hide");
            for(var apiInPayload in event.payload.value)
                apisInRepeater[event.payload.value[apiInPayload]["id"]] = event.context.item.value.id;
            for(var i in r) {
                if(r[i]["id"] == event.context.item.value.id) {
                    r[i]["selectedAPIs"] = event.payload.value;
                    break;
                }
            }
        }

        api.emit("SCOPE_AND_APIS_CHANGED", {"scopesAndAPIs": {...r}, "onLoad": "false"});
    } else if (event.elementId == "button_5") {
        var repeaterID = api.state.repeaterID;
        var repeaterData = api.state.repeaterData;
        repeaterData.push({"id": repeaterID+1, "selectedAPIs":[], "selectedScope": ""});
        api.setState("repeaterID", repeaterID+1);
        api.setState('disableAddNewRow', true);
    } else if (event.elementId == "alert_1") {
        updateAlert("hide");
    } else if (event.elementId == "get_auth_scopes_and_api_for_oauth_entity_1") {
        // seems the client states are cached when switching between pages, resetting client parameters 
        api.setState("scopesInRepeater", {});
        api.setState("apisInRepeater", {});
        let disableAddNewRow = true;
        let noScopes = false;
        var result = api.data.get_auth_scopes_and_api_for_oauth_entity_1.output;
        var repeaterNewData = [];
        var count = 0;
        if(result.scope_restriction_status) {
            api.setState('scopeRestrictionStatusRecommendationDisabled', result.scope_restriction_status);
        }
        if( (result["error"] != undefined && result["error"] == "-1") || (result["mappedScopes"] != undefined && result["mappedScopes"].length == 0)) {
            repeaterNewData = [{"id":count,"selectedAPIs":[],"selectedScope":""}];
            noScopes = true;
            count+=1;
        } else {
            var scopesInRepeater = api.state.scopesInRepeater;
            var apisInRepeater = api.state.apisInRepeater;
            repeaterNewData = [];
            for(let index in result["mappedScopes"]) {
                var scope = result["mappedScopes"][index];
                if(scope == useraccountScope)
                    api.setState("useraccountInRepeater", true);
                var apisForScope = result["apis"][scope] ? result["apis"][scope] : [];
                repeaterNewData.push({"id": count, "selectedScope": scope, "selectedAPIs": apisForScope});
                scopesInRepeater[scope] = count;
                for(var apiIndex in apisForScope)
                    apisInRepeater[apisForScope[apiIndex]["id"]] = count;
                count+=1;
            }
            api.setState("scopesInRepeater", scopesInRepeater);
            api.setState("apisInRepeater", apisInRepeater);
        }
        api.setState("repeaterData", repeaterNewData);
        api.setState("repeaterID", repeaterNewData.length);
        var availableAuthScope = api.state.availableAuthScope;
        if(repeaterNewData.length < availableAuthScope.length) {
            disableAddNewRow = false;
        } // no use of adding rows 
        api.setState('disableAddNewRow', disableAddNewRow || noScopes);
        api.emit("SCOPE_AND_APIS_CHANGED", {"scopesAndAPIs": {...repeaterNewData}, "onLoad": "true"});
    } else if (event.elementId == "create_auth_scope") {
        let disableAddNewRow = true;
        try {
            if(event.payload.data.output.data.GlideRecord_Mutation.insert_sys_auth_scope != null) {
                api.data.get_all_auth_scopes_1.refresh();
                disableAddNewRow = false;
                updateAlert("successNewAuthScope");
            } else {
                api.setState("authScopeError", "failedNewAuthScope");
            }
        } catch(e) {
            api.setState("authScopeError", "failedNewAuthScope");
        }
        api.setState('disableAddNewRow', disableAddNewRow);
        
    } else if (event.elementId == "scope_input") {
        let fieldValue = event.payload.fieldValue || event.payload.value;
        let disableSave = false;

        if(fieldValue == '' || fieldValue == undefined) {
            disableSave = true;
            api.setState("authScopeError", "");
        } else {
            updateAlert("hide");
            api.setState('newScopeName', fieldValue);
            for(let index in api.state.availableAuthScope) {
                if(api.state.availableAuthScope[index]["label"] == fieldValue) {
                    disableSave = true;
                    api.setState("authScopeError", "existingNewAuthScope");
                    break;
                }
            }
            if(!disableSave)
                api.setState("authScopeError", "");
        }
        api.setState('disableSave', disableSave);
    }

    async function updateAlert(type, scopeName) {
        var alert = {};
        if(type == "authscope")
            alert = {"type":"critical", "message": api.state.translatedMessages.authscope,"action":{"type":"acknowledge","label":"Close"},"hideAlert":false};

        if(type == "apis")
            alert = {"type":"critical", "message": await helpers.translate("REST API already associated to the '{0}' scope.", scopeName), "action":{"type":"acknowledge","label":"Close"},"hideAlert":false};        
        
        if(type == "successNewAuthScope")
            alert = {"type":"positive", "message": api.state.translatedMessages.successNewAuthScope,"action":{"type":"acknowledge","label":"Close"},"hideAlert":false};


        if(type == "hide")
            alert = {"hideAlert":true};
        
        api.setState("alert", alert);
    
        if(type != "hide")
            helpers.timing.setTimeout(() => updateAlert("hide"), 2000);
    }
}
