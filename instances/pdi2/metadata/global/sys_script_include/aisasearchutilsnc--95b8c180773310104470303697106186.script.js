var AISASearchUtilSNC = Class.create();
AISASearchUtilSNC.prototype = {
	RP_UTILS: new AISARecordProducerUtils(),
	ACTION_UTILS: new AISAActionUtils(),
    ERRORS: {
        EMPTY_REQ: 'EMPTY_REQUEST',
        INVALID_ARGS: 'INVALID_ARGUMENTS'
    },
	
    initialize: function() {
    },

    search: function(req) {
        if (!req) {
            return {
                status: 400, 
                msg: this.ERRORS['EMPTY_REQ']
            };
        } 
        else if (!req.searchContextConfigId || !req.searchTerm || !req.rpSysId) {
            return {
                status: 400, 
                msg: this.ERRORS['INVALID_ARGS']
            };
        }

        var aisResults = this._getResults(this._generateArgs(req));
		var actions = this.ACTION_UTILS.getActionsForSearchApp(req.searchContextConfigId);
		var availableActionsMap = {};
		actions.forEach(function(action) {
			availableActionsMap[action.sysId] = action;
		});
        var aisaResultsActionsMap = this._getResultActionsMap(actions, aisResults.searchResults);

        return {
            status: 200,
            msg: 'SUCCESS',
            data: {
				search: aisResults,
				resultsActionsMap: aisaResultsActionsMap,
				availableActions: availableActionsMap
			}
        };
    },

	_generateArgs: function(reqObj) {
		var argsObj = {
			searchContextConfigId: '',
			searchTerm: '',
			paginationToken: '',
			disableSpellCheck: false,
			facetFilters: [],
			searchFilters: [],
			requestedFields: {}
		};
		
		for (var prop in reqObj) {
			if (reqObj.hasOwnProperty(prop) && argsObj.hasOwnProperty(prop)) 
				argsObj[prop] = reqObj[prop];
		}
		
		return argsObj;
	},

	_getResults: function (req) {
		var searchResultObj = {};
        var aisScriptableAPI = new sn_search.ScriptableSearchAPI();

        var aisResponse = aisScriptableAPI.search(req.searchContextConfigId, req.searchTerm, req.paginationToken, req.disableSpellCheck, req.facetFilters, req.searchFilters, req.requestedFields);
		if (aisResponse) {
			searchResultObj.term = aisResponse.getTerm();
			var searchResults = aisResponse.getSearchResults();

			var resultsArr = [];
			for (var i = 0; i < searchResults.length; i++) {
				var currResultTable = searchResults[i].getTable();
				if (currResultTable === "sys_attachment")
					continue;
				var singleResult = {};
				singleResult["sysId"] = searchResults[i].getSysId();
				singleResult["table"] = currResultTable;
				singleResult["text"] = searchResults[i].getText();
				singleResult["title"] = searchResults[i].getTitle();

				var columnsArr = searchResults[i].getColumns();
				var columns = [];
				for (var j = 0; j < columnsArr.length; j++) {
					var singleColumn = {};
					singleColumn["fieldName"] = columnsArr[j].getFieldName();
					singleColumn["label"] = columnsArr[j].getLabel();
					singleColumn["value"] = columnsArr[j].getValue();
					singleColumn["displayValue"] = columnsArr[j].getDisplayValue();
					columns.push(singleColumn);
				}

				singleResult["columns"] = columns;
				resultsArr.push(singleResult);
			}

			searchResultObj.searchResults = resultsArr;
			searchResultObj.count = resultsArr.length;
		}
		return searchResultObj;
    },
	/**
	 * Check action visibility for each action on each result
	 * 1. check action visibility, based on either resultTableCondition or visibilityScript
	 * 2. Dedup based on action's specificity: Search App, Result Table
	 * @param {string} searchApp - The sys_id of search application if any.
	 * @param {array} searchResults - the list of search result retrieved by search service
	 * 
	 * @returns {object} actionMap - mapping results sysId with a list of actions
	 */
    _getResultActionsMap: function (actions, searchResults) {
		var actionMap = {};
		var resultsIdByTable = {};
		searchResults.forEach(function(result) {
			if (!resultsIdByTable[result.table])
				resultsIdByTable[result.table] = [];
			resultsIdByTable[result.table].push(result.sysId);
		});
		
		for (var table in resultsIdByTable) {
			var resultGr = new GlideRecord(table);
			resultGr.addQuery('sys_id', 'IN', resultsIdByTable[table].join(','));
			resultGr.query();
			while (resultGr.next()) {
				actionMap[table+ ':' + resultGr.getUniqueValue()] = this._getActionsForResult(actions, resultGr);
			}
		}
		return actionMap;
    },

	/**
	 * Check action visibility for each action on given result, and return a list of action sysIds.
	 * 1. dedup actions with same actionId based on action's specificity: Search App, Result Table
	 * 2. check action visibility on result, based on either resultTableCondition or visibilityScript
	 *
	 * @param {Object[]} actions - list of action Objects built from AISAActionUtils._getActionObjectFromGr
	 * @param {GlideRecord} resultGr - GlideRecord Object of one result.
	 * 
	 * @returns {string[]} visibleActionSysIds - a list of action sysIds eligible for given resultGr
	 */
	_getActionsForResult: function(actions, resultGr) {
		var visibleActionMap = {};
		var _actionVisibleForResult = this._actionVisibleForResult;
		actions.forEach(function(action) {
			/** ** ** ** specificity priority chart ** ** ** ** ** **
			|                | has result table  | no result table  |
			| has search app |         3         |         2        |
			| no search app  |         1         |         0        |
			** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/

			var priority = 0;
			if (action.searchApp)
				priority += 2;
			if (action.resultTable)
				priority += 1;
			if ((!visibleActionMap[action.actionId] || visibleActionMap[action.actionId].priority < priority) && _actionVisibleForResult(action, resultGr)) {
				action.priority = priority;
				visibleActionMap[action.actionId] = action;
			}
		});
		var visibleActionSysIds = [];
		actions.forEach(function(action) {
			if (visibleActionMap[action.actionId] === action)
				visibleActionSysIds.push(action.sysId);
		});
		return visibleActionSysIds;
	},
	
	/**
	 * Check visibility of one action for a given result, return true if visible.
	 * visibility based on either resultTableCondition or visibilityScript
	 *
	 * @param {Object} actions - action Objects built from AISAActionUtils._getActionObjectFromGr
	 * @param {GlideRecord} resultGr - GlideRecord Object of one result record
	 * 
	 * @returns {boolean} visible
	 */
	_actionVisibleForResult: function(action, resultGr) {

		if (action.resultTable && action.resultTable !== resultGr.getTableName())
			return false;

		if (action.scriptedVisibility) {
			var evaluator = new GlideScopedEvaluator();
			var actionGr = new GlideRecord('aisa_ui_action');
			actionGr.initialize();
			actionGr.get(action.sysId);
			return !! evaluator.evaluateScript(actionGr, 'ui_action_visibility_script', {"result": resultGr});
		} else if (action.resultTableCondition) {
			return GlideFilter.checkRecord(resultGr, action.resultTableCondition);
		}
		return true;
	},

    type: 'AISASearchUtilSNC'
};
