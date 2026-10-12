function include({imports}, api, helpers) {
     const consumersConfig = {
       "gen_ai_agent" : {
        	"params" : {
    			"agenticAsset" : "gen_ai_agent"
        	}
        },
       "gen_ai_workflow" : {
		"params" : {
    			"agenticAsset" : "gen_ai_workflow"
        	}
       }
     };

	// Get User/Group/Role sys_id based on Analyze by set
 	function _getAnalyzeBySysId(api) {
		switch (api.state.selectedAnalyzeBy) {
			case "User":
				return api.state.selectedUser;
			case "Group":
				return api.state.selectedGroup;
			case "Role":
				return api.state.selectedRole;
                        default:
				return "";
		}
	}

	function _getOperationsByRuleType(api) {
		switch (api.state.selectedRuleType) {
			case "record":
				var operations = ["read",  "write",  "create",  "report_view",  "report_on",  "list_edit",  "add_to_list",
						"save_as_template",  "personalize_choices", "query_match", "query_range"];
				if (api.state.selectedField === null) {
					operations.push("delete");
				}
				return operations;

			case "ui_page":
				return ["read"];

			case "client_callable_script_include":
			case "rest_endpoint":
				return ["execute"];
			case "gen_ai_agent":
				return ["execute"];
			case "gen_ai_workflow":
				return ["execute"];
			default:
				return [];
		}
	}

	function _getCompareAccessOperationsByRuleType(api) {
		const ruleType = api.state.compareAccessTab.uacRuleType;
		switch (ruleType) {
			case "record":
				var operations = ["read",  "write",  "create",  "report_view",  "report_on",  "list_edit",  "add_to_list",
						"save_as_template",  "personalize_choices", "query_match", "query_range"];
				const isTableLevel = api.state.compareAccessTab.uacField.selectedId === null;
				if (isTableLevel) {
					operations.push("delete");
				}
				return operations;

			case "ui_page":
				return ["read"];

			case "client_callable_script_include":
			case "rest_endpoint":
				return ["execute"];
			default:
				return [];
		}
	}

	function _getTargetNameByRuleType(api) {
		switch(api.state.selectedRuleType) {
			case "record":
				return api.state.selectedTable;
			case "client_callable_script_include":
				return api.state.selectedClientScript;
			case "rest_endpoint":
				return api.state.selectedRESTEndpoint;
			case "ui_page":
				return api.state.selectedUIPage;
			case "gen_ai_agent":
				return api.state.selectedAIAgent;
			case "gen_ai_workflow":
				return api.state.selectedAgentUsecase;
			default:
				return "";
		}
	}

	function _getAnalyzedForDisplayVal(request_resource_result) {
		var analyzedForDisplayVal = "";
		switch (request_resource_result.analyze_by.value) {
			case "User":
			  analyzedForDisplayVal = request_resource_result.user.displayValue;
			  break;

			case "Group":
			  analyzedForDisplayVal = request_resource_result.group.displayValue;
			  break;

			case "Role":
			  analyzedForDisplayVal = request_resource_result.role.displayValue;
			  break;
		}
		return analyzedForDisplayVal;
	}

	function _getDateTimeObj(dateTimeStr) {
		let arr = dateTimeStr.split(/\s+/);
		return {
			date: arr[0],
			time: arr[1]
		}
	}

    function _getAlertObj(id, content, textLinkProps) {
        return {
            id: id,
            status: "high",
            icon: "diamond-exclamation-outline",
            content: content,
            action: {
                    type: "dismiss"
            },
            textLinkProps: textLinkProps
        };
    }

    function updateState(objKey, key, value) {
        let data = value == undefined ? key : {
            [key]: value
        };
        api.setState(objKey, ctx => ({
            ...ctx.currentValue,
            ...data
        }));
    }

    function log(...args) {
        // Will be used in development stage
        // console.log.apply(null, ["[AA_LOG] : ",   ...args]);
    }

    function navigate({route, fields, params, redirect = false, passiveNavigation, targetRoute, external, title}) {
        external = external ? {url: external} : null;
        helpers.navigate.to(route, fields, params, redirect, passiveNavigation, targetRoute, external, title);
    }

    function updateSessionProps(key, value) {
        updateState("sessionProps", key, value);
    }

    function callAccessInsightsDB(action, payload) {
        let params = _prepareRequest({
            action: action,
            payload: payload
        }, '4a9f175f93b7f1104fc44c52848918f8');
        return new Promise((resolve, reject) => {
            helpers
                .snHttp('/api/now/uxf/databroker/exec', params)
                .then(res => {
                    resolve(res.response.result[0]);
                });
        });
    }

    function _prepareRequest(params, definitionSysId) {
        let inputValues = {};
        Object.keys(params).forEach(key => {
            inputValues[key] = {
                type: "JSON_LITERAL",
                value: params[key]
            };
        });
        return {
            method: "POST",
            body: [{
                type: "TRANSFORM",
                definitionSysId: definitionSysId,
                inputValues: inputValues
            }]
        };
    }

    // Returns params, for the different consumers, for redirections
    function getUrlParamsForTheConsumer(consumerType) {
		return consumersConfig[consumerType] ? consumersConfig[consumerType]["params"] : null
    }

    return {
        getAnalyzeBySysId: _getAnalyzeBySysId,
        getOperationsByRuleType: _getOperationsByRuleType,
        getCompareAccessOperationsByRuleType: _getCompareAccessOperationsByRuleType,
        getTargetNameByRuleType: _getTargetNameByRuleType,
        getAnalyzedForDisplayVal: _getAnalyzedForDisplayVal,
        getAlertObj: _getAlertObj,
        getDateTimeObj: _getDateTimeObj,
        updateState,
        updateSessionProps,
        navigate,
        log: log,
        callAccessInsightsDB,
        getUrlParamsForTheConsumer
    };
}
