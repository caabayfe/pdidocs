var ParentGraphReferenceQualifier = Class.create();
ParentGraphReferenceQualifier.prototype = {
	initialize: function() {},

	getEligibleParents: function() {
		var currentSysId = current.getUniqueValue();
		if (!currentSysId)
			return 'model!=contribution^ORparentISEMPTY^EQ';

		var ineligible = [];
		ineligible.push(currentSysId);
		this._getDescendants(currentSysId, ineligible);

		return 'sys_idNOT IN' + ineligible.join(',') + '^model!=contribution^ORparentISEMPTY^EQ';
	},

	_getDescendants: function(sysId, result) {
		var gr = new GlideRecord('sys_meta_graph');
		gr.addQuery('parent', sysId);
		gr.query();
		while (gr.next()) {
			var childId = gr.getUniqueValue();
			if (result.indexOf(childId) === -1) {
				result.push(childId);
				this._getDescendants(childId, result);
			}
		}
	},

	type: 'ParentGraphReferenceQualifier'
};
