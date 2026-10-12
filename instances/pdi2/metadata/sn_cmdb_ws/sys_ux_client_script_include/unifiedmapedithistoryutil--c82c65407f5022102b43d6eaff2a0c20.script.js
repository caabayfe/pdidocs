function include({ imports }) {
	//unifiedMapEditHistoryUtil shared client script include in mapSearchFilterController
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

	const ENTRY_EDIT_ACTION = "editAction";
	const ENTRY_NODE_LIST = "nodes";
	const ENTRY_EDGE_LIST = "edges";
	const ENTRY_EDIT_TYPE = "editType";

	// Note - this is subject to change once Edit History Panel design is finalized.
	// Consider more descriptive edit phrase and / or translations
	const ACTION_SHOW_NODE = "Show Node";
	const ACTION_HIDE_NODE = "Hide Node";
	const ACTION_ADD_EDGE = "Add Edge";
	const ACTION_UPDATE_EDGE = "Update Edge";
	const ACTION_DELETE_EDGE = "Delete Edge";
	const ACTION_SHOW_EDGE = "Show Edge";
	const ACTION_HIDE_EDGE = "Hide Edge";

	const EDIT_TYPE_SHOW = "show";
	const EDIT_TYPE_HIDE = "hide";
	const EDIT_TYPE_UPSERT = "upsert";
	const EDIT_TYPE_DELETE = "delete";


	// Note - show and hide may need to support a set of edges and nodes in a single edit event.
	// Will depend on Edit Mode panel design.
	const _showNode = (api, nodeInfo) => {
		_appendToEditHistory(api, nodeInfo, ENTRY_NODE_LIST, ACTION_SHOW_NODE, EDIT_TYPE_SHOW);
	};

	const _hideNode = (api, nodeInfo) => {
		_appendToEditHistory(api, nodeInfo, ENTRY_NODE_LIST, ACTION_HIDE_NODE, EDIT_TYPE_HIDE);
	};
	// Special history case, in which an unpersisted node is removed from the map.
	// Any and all changes to both it and associated edges should be removed from this edit history entry.
	const _removeNodeHistory = (api, nodeInfo) => {
		_appendPurgedNodeEditHistory(api, nodeInfo, ACTION_HIDE_NODE);
	};

	const _addEdge = (api, edgeInfo) => {
		_appendToEditHistory(api, edgeInfo, ENTRY_EDGE_LIST, ACTION_ADD_EDGE, EDIT_TYPE_UPSERT);
	};

	const _updateEdge = (api, edgeInfo) => {
		_appendToEditHistory(api, edgeInfo, ENTRY_EDGE_LIST, ACTION_UPDATE_EDGE, EDIT_TYPE_UPSERT);
	};

	const _deleteEdge = (api, edgeInfo) => {
		_appendToEditHistory(api, edgeInfo, ENTRY_EDGE_LIST, ACTION_DELETE_EDGE, EDIT_TYPE_DELETE);
	};

	const _showEdge = (api, edgeInfo) => {
		_appendToEditHistory(api, edgeInfo, ENTRY_EDGE_LIST, ACTION_SHOW_EDGE, EDIT_TYPE_SHOW);
	};

	const _hideEdge = (api, edgeInfo) => {
		_appendToEditHistory(api, edgeInfo, ENTRY_EDGE_LIST, ACTION_HIDE_EDGE, EDIT_TYPE_HIDE);
	};


	const _getHistory = (api) => {
		return api.state.editModeHistory;
	}

	const _copyLastEdit = (editHistory) => {

		if (editHistory && editHistory.length > 0) {
			return cloneDeep(editHistory[editHistory.length - 1]);
		}

		var lastEdit = {};
		lastEdit[ENTRY_EDIT_ACTION] = "";
		lastEdit[ENTRY_NODE_LIST] = [];
		lastEdit[ENTRY_EDGE_LIST] = [];

		return lastEdit;
	}

	const _appendToEditHistory = (api, objInfo, objType, actionType, editType) => {
		var editHistory = _getHistory(api);
		var historyEntry = _copyLastEdit(editHistory);
		historyEntry[ENTRY_EDIT_ACTION] = actionType;

		var editedObj = cloneDeep(objInfo);
		editedObj[ENTRY_EDIT_TYPE] = editType;

		_mergeIntoObjectList(historyEntry[objType], editedObj);
		editHistory.push(historyEntry);
	}

	const _mergeIntoObjectList = (objList, editedObj) => {
		for (var objIdx = 0; objIdx < objList.length; objIdx++) {
			var existingObj = objList[objIdx];
			if (existingObj && existingObj.id === editedObj.id) {
				objList[objIdx] = editedObj;
				return;
			}
		}
		objList.push(editedObj);
	}

	const _appendPurgedNodeEditHistory = (api, nodeInfo, actionType, editType) => {
		var editHistory = _getHistory(api);
		var historyEntry = _copyLastEdit(editHistory);
		historyEntry[ENTRY_EDIT_ACTION] = actionType;
		var nodeList = historyEntry[ENTRY_NODE_LIST];
		nodeList = nodeList.filter(node => node.id !== nodeInfo.id);
		historyEntry[ENTRY_NODE_LIST] = nodeList;
		var edgeList = historyEntry[ENTRY_EDGE_LIST];
		edgeList = edgeList.filter(edge => edge.sourceId !== nodeInfo.id && edge.targetId !== nodeInfo.id);
		historyEntry[ENTRY_EDGE_LIST] = edgeList;
		editHistory.push(historyEntry);
	}
	return {
		historyShowNode: _showNode,
		historyHideNode: _hideNode,
		historyForgetNode: _removeNodeHistory,
		historyAddEdge: _addEdge,
		historyUpdateEdge: _updateEdge,
		historyDeleteEdge: _deleteEdge,
		historyShowEdge: _showEdge,
		historyHideEdge: _hideEdge
	};
}	
