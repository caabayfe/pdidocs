(function executeRule(current, previous /*null when async*/) {

	var proposedParentId = current.getValue('parent');

	// Self-parent check
	if (proposedParentId === current.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('Cannot set a graph as its own parent'));
		current.setAbortAction(true);
		return;
	}

	// Descendant check - walk children recursively
	var descendants = [];
	_getDescendants(current.getUniqueValue(), descendants);
	if (descendants.indexOf(proposedParentId) !== -1) {
		gs.addErrorMessage(gs.getMessage('Cannot set a descendant graph as parent - it would create a cycle'));
		current.setAbortAction(true);
		return;
	}

	function _getDescendants(sysId, result) {
		var gr = new GlideRecord('sys_meta_graph');
		gr.addQuery('parent', sysId);
		gr.query();
		while (gr.next()) {
			var childId = gr.getUniqueValue();
			if (result.indexOf(childId) === -1) {
				result.push(childId);
				_getDescendants(childId, result);
			}
		}
	}

})(current, previous);
