function transform(input) {
	
	function _getParentString(rel) {
		if (rel.level > 1) {
			return "[" + _getParentNames(rel.parents) + " \u21E2 ] ";
		}
		return "";
	}
	
	function _getParentNames(parentArr) {
		var parentNames = [];
		for (var i = 0; i < parentArr.length; i++) {
			parentNames.push(parentArr[i].name);
		}
		
		return parentNames.sort().join(", ");
	}
	
	var result = {};
	var entries = JSON.parse(input.relData).relations;

	var items = [];
	var expandedItems = [];
	entries.forEach(function(entry) {
		var category = {};
		category.id = entry.relationTypeSysId + entry.ciClassDisplayName;
		category.relationTypeDesc = entry.relationTypeDesc;
		category.label = entry.relationTypeDesc + " - " + entry.ciClassDisplayName;
		category.children = [];
		expandedItems.push([category.id]);
		entry.relations.forEach(function(rel) {
			var node = {};
			node.id = rel.childSysId;
			node.ciName = rel.childName;
			node.label = "[L" + rel.level + "] " + _getParentString(rel) + rel.childName;
			node.actionable = true;
			node.table = entry.ciSysClass;
			node.sysId = rel.childSysId;
			node.children = [];
			category.children.push(node);
		});
		category.children.sort(function compare(a, b) {
			return a.label.localeCompare(b.label);
		});
		items.push(category);
	});
	
	items.sort(function compare(a, b) {
		return a.relationTypeDesc.localeCompare(b.relationTypeDesc);
	});
	
	result.items = items;
	result.expandedItems = expandedItems;
	
	return result;
}
