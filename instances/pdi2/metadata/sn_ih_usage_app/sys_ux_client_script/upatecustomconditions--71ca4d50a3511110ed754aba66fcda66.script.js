/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function upateCustomConditions({api, event, helpers, imports}) {
    var customTransactionTypeFilter = 'sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfLastMonth()';
    var customIHUsageCondition = "license_id=IntegrationHubPool^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfLastMonth()";
    var baseOrchestrationCondition = "activity.activity_definition.sys_scope.scopeNOT LIKEsn_hr_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_sec_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_si_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_ti_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_vul_^activity.activity_definition.sys_package.source!=com.snc.aws.activities^activity.activity_definition.sys_package.source!=com.snc.aws.common^activity.activity_definition.sys_package.source!=com.snc.aws.core^activity.activity_definition.sys_package.source!=com.snc.discovery.aws^activity.activity_definition.sys_package.source!=com.snc.ec2_v2^activity.activity_definition.sys_package.source!=com.snc.orchestration.activities.ec2^activity.activity_definition.sys_package.source!=com.snc.discovery.azure^activity.activity_definition.sys_package.source!=com.snc.orchestration.activities.vmware^activity.activity_definition.sys_package.source!=com.snc.runbook_automation.virtualization^activity.activity_definition.sys_package.source!=com.snc.virtualization.core";
    
    // Default orchestration condition with default date range
    var customOrchestrationCondition = baseOrchestrationCondition + "^sys_created_on>=javascript:gs.beginningOfLast12Months()^sys_created_on<=javascript:gs.endOfLastMonth()";

    //Tech Debt: Fetching Date Filter data from event instead of state. Need to revisit.
    var DateParFiltersVar = [];
    const { appliedFilters } = event.payload;

    //Single filter applied (Date)
    if (appliedFilters && appliedFilters.length > 0 && appliedFilters[0] && appliedFilters[0].type === "date") {
        DateParFiltersVar = appliedFilters;
        if (DateParFiltersVar && DateParFiltersVar.length > 0 && DateParFiltersVar[0] && DateParFiltersVar[0].start && DateParFiltersVar[0].end) {
            customTransactionTypeFilter = "sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateParFiltersVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('" + DateParFiltersVar[0].end + "','23:59:59')";
            customIHUsageCondition = "license_id=IntegrationHubPool^sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateParFiltersVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('"+ DateParFiltersVar[0].end +"','23:59:59')";
        }
    } else if (appliedFilters && appliedFilters.length > 0 && appliedFilters[0] && appliedFilters[0].type === "choice" && api.state.parFilters.length === 0 && appliedFilters[0].values) { //Single filter applied (Caller Scope/Spoke)
        if (appliedFilters[0].apply_to[0] === "ua_ih_usage.caller_scope_ref") {
                    customTransactionTypeFilter = customTransactionTypeFilter + '^caller_scope_ref=' + appliedFilters[0].values[0];
                    customIHUsageCondition = customIHUsageCondition + '^caller_scope_ref=' + appliedFilters[0].values[0];
                    if (appliedFilters[0].values.length > 1) {
                        for (var j = 1; j < appliedFilters[0].values.length; j++) {
                            customTransactionTypeFilter = customTransactionTypeFilter + '^ORcaller_scope_ref=' + appliedFilters[0].values[j];
                            customIHUsageCondition = customIHUsageCondition + '^ORcaller_scope_ref=' + appliedFilters[0].values[j];
                        }
                    }
        } else if (appliedFilters[0].apply_to[0] === "ua_ih_usage.spoke_reference") {
                    customTransactionTypeFilter = customTransactionTypeFilter + '^spoke_reference=' + appliedFilters[0].values[0];
                    customIHUsageCondition = customIHUsageCondition + '^spoke_reference=' + appliedFilters[0].values[0];
                    if (appliedFilters[0].values.length > 1) {
                        for (var j = 1; j < appliedFilters[0].values.length; j++) {
                            customTransactionTypeFilter = customTransactionTypeFilter + '^ORspoke_reference=' + appliedFilters[0].values[j];
                            customIHUsageCondition = customIHUsageCondition + '^ORspoke_reference=' + appliedFilters[0].values[j];
                        }
                    }
        }
    }

    if (api && api.state && api.state.parFilters && api.state.parFilters.length > 0) { //Multi filter applied
        var parFiltersVar = api.state.parFilters;
        var DateFilterVar = parFiltersVar.filter(pf => pf.type === "date");
        if (DateFilterVar && DateFilterVar.length > 0 && appliedFilters[0].type !== "date") {
            customTransactionTypeFilter = "sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateFilterVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('" + DateFilterVar[0].end + "','23:59:59')";
            customIHUsageCondition = "license_id=IntegrationHubPool^sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateFilterVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('"+ DateFilterVar[0].end +"','23:59:59')";
            customOrchestrationCondition = baseOrchestrationCondition + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + DateFilterVar[0].start + "','00:00:00')@javascript:gs.dateGenerate('" + DateFilterVar[0].end + "','23:59:59')";
        }
        parFiltersVar = parFiltersVar.concat(appliedFilters);
        for (var i = 0; i< parFiltersVar.length; i++) {
            if (parFiltersVar[i] && parFiltersVar[i] && parFiltersVar[i].apply_to && parFiltersVar[i].values && parFiltersVar[i].values.length > 0 && appliedFilters[0].values) {
               if (parFiltersVar[i].apply_to[0] === "ua_ih_usage.caller_scope_ref") {
                    if (appliedFilters[0].apply_to[0] === "ua_ih_usage.caller_scope_ref") {
                        customTransactionTypeFilter = customTransactionTypeFilter + '^caller_scope_ref=' + appliedFilters[0].values[0];
                        customIHUsageCondition = customIHUsageCondition + '^caller_scope_ref=' + appliedFilters[0].values[0];
                        if (appliedFilters[0].values.length > 1) {
                            for (var j = 1; j < appliedFilters[0].values.length; j++) {
                                customTransactionTypeFilter = customTransactionTypeFilter + '^ORcaller_scope_ref=' + appliedFilters[0].values[j];
                                customIHUsageCondition = customIHUsageCondition + '^ORcaller_scope_ref=' + appliedFilters[0].values[j];
                            }
                        }
                    } else {
                        customTransactionTypeFilter = customTransactionTypeFilter + '^caller_scope_ref=' + parFiltersVar[i].values[0];
                        customIHUsageCondition = customIHUsageCondition + '^caller_scope_ref=' + parFiltersVar[i].values[0];
                        if (parFiltersVar[i].values.length > 1) {
                            for (var j = 1; j < parFiltersVar[i].values.length; j++) {
                                customTransactionTypeFilter = customTransactionTypeFilter + '^ORcaller_scope_ref=' + parFiltersVar[i].values[j];
                                customIHUsageCondition = customIHUsageCondition + '^ORcaller_scope_ref=' + parFiltersVar[i].values[j];
                            }
                        }
                    }
                } else if (parFiltersVar[i].apply_to[0] === "ua_ih_usage.spoke_reference") {
                    if (appliedFilters[0].apply_to[0] === "ua_ih_usage.spoke_reference") {
                        customTransactionTypeFilter = customTransactionTypeFilter + '^spoke_reference=' + appliedFilters[0].values[0];
                        customIHUsageCondition = customIHUsageCondition + '^spoke_reference=' + appliedFilters[0].values[0];
                        if (appliedFilters[0].values.length > 1) {
                            for (var j = 1; j < appliedFilters[0].values.length; j++) {
                                customTransactionTypeFilter = customTransactionTypeFilter + '^ORspoke_reference=' + appliedFilters[0].values[j];
                                customIHUsageCondition = customIHUsageCondition + '^ORspoke_reference=' + appliedFilters[0].values[j];
                            }
                        }
                    } else {
                        customTransactionTypeFilter = customTransactionTypeFilter + '^spoke_reference=' + parFiltersVar[i].values[0];
                        customIHUsageCondition = customIHUsageCondition + '^spoke_reference=' + parFiltersVar[i].values[0];
                        if (parFiltersVar[i].values.length > 1) {
                            for (var j = 1; j < parFiltersVar[i].values.length; j++) {
                                customTransactionTypeFilter = customTransactionTypeFilter + '^ORspoke_reference=' + parFiltersVar[i].values[j];
                                customIHUsageCondition = customIHUsageCondition + '^ORspoke_reference=' + parFiltersVar[i].values[j];
                            }
                        }
                    }
                }
            }
        }
    }


/*    if (api && api.state && api.state.parFilters && api.state.parFilters.length > 0) {
        var parFiltersVar = api.state.parFilters;
        var DateFilterVar = parFiltersVar.filter(pf => pf.type === "date");
        if (DateFilterVar && DateFilterVar.length > 0) {
            customTransactionTypeFilter = "sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateFilterVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('" + DateFilterVar[0].end + "','23:59:59')";
            customIHUsageCondition = "license_id=IntegrationHubPool^sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateFilterVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('"+ DateFilterVar[0].end +"','23:59:59')";
        }
        for (var i = 0; i< parFiltersVar.length; i++) {
            if (parFiltersVar[i] && parFiltersVar[i] && parFiltersVar[i].apply_to && parFiltersVar[i].values && parFiltersVar[i].values.length > 0 ) {
                if (parFiltersVar[i].apply_to[0] === "ua_ih_usage.caller_scope_ref") {
                    customTransactionTypeFilter = customTransactionTypeFilter + '^caller_scope_ref=' + parFiltersVar[i].values[0];
                    customIHUsageCondition = customIHUsageCondition + '^caller_scope_ref=' + parFiltersVar[i].values[0];
                    if (parFiltersVar[i].values.length > 1) {
                        for (var j = 1; j < parFiltersVar[i].values.length; j++) {
                            customTransactionTypeFilter = customTransactionTypeFilter + '^ORcaller_scope_ref=' + parFiltersVar[i].values[j];
                            customIHUsageCondition = customIHUsageCondition + '^ORcaller_scope_ref=' + parFiltersVar[i].values[j];
                        }
                    }
                } else if (parFiltersVar[i].apply_to[0] === "ua_ih_usage.spoke_reference") {
                    customTransactionTypeFilter = customTransactionTypeFilter + '^spoke_reference=' + parFiltersVar[i].values[0];
                    customIHUsageCondition = customIHUsageCondition + '^spoke_reference=' + parFiltersVar[i].values[0];
                    if (parFiltersVar[i].values.length > 1) {
                        for (var j = 1; j < parFiltersVar[i].values.length; j++) {
                            customTransactionTypeFilter = customTransactionTypeFilter + '^ORspoke_reference=' + parFiltersVar[i].values[j];
                            customIHUsageCondition = customIHUsageCondition + '^ORspoke_reference=' + parFiltersVar[i].values[j];
                        }
                    }
                }
            }
        }
    }*/
    var customConditions = {
        'transactionTypeConditions' : customTransactionTypeFilter,
        'ihUsageConditions' : customIHUsageCondition,
        'orchestrationConditions': customOrchestrationCondition
    };
    api.setState('customConditions', customConditions);
}
