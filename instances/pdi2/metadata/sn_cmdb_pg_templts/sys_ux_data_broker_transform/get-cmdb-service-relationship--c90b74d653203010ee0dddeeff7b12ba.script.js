function transform(input) {
	var recordId = input.recordId;

	var result = {};

	result.tree = [
		{"id":"biz_app_parent", "label": gs.getMessage("Business Applications"), "actionable": false, "children":[]},
		{"id":"biz_offer_parent", "label": gs.getMessage("Business Service Offerings"), "actionable": false, "children":[]},
		{"id":"tech_offer_parent", "label":gs.getMessage("Technical Service Offerings"), "actionable": false, "children":[]},
		{"id":"app_service_parent", "label":gs.getMessage("Application Services"), "actionable": false, "children":[]}
	];
	
	var addedCIs = {};

	var gr = new GlideRecord('cmdb_rel_ci');
	gr.addQuery("child", recordId);
	gr.addEncodedQuery("parent.sys_class_name=cmdb_ci_business_app^ORparent.sys_class_name=service_offering^ORparent.sys_class_nameINSTANCEOFcmdb_ci_service");
	gr.query();

	while (gr.next()) {
		var parentName = gr.getDisplayValue('parent');
		var parentId = gr.getValue('parent');
		if (addedCIs[parentId]) {
			continue;
		}
		var parentClassName = gr.parent.sys_class_name;
		var parentOfferType = gr.parent.service_classification;
		var parentNode = {"id": parentId, "label": parentName, "actionable": true, "children":[]};
		if (parentClassName == 'cmdb_ci_business_app') {
			result.tree[0].children.push(parentNode);
			addedCIs[parentId] = true;
		} else if (parentClassName == 'service_offering' && parentOfferType == 'Business Service') {
			result.tree[1].children.push(parentNode);
			addedCIs[parentId] = true;
		} else if (parentClassName == 'service_offering' && parentOfferType == 'Technical Service') {
			result.tree[2].children.push(parentNode);
			addedCIs[parentId] = true;
		} else if (parentOfferType == 'Application Service') {
			result.tree[3].children.push(parentNode);
			addedCIs[parentId] = true;
		}
	}
	
	gr = new GlideRecord('cmdb_rel_ci');
	gr.addQuery("parent", recordId);
	gr.addEncodedQuery("child.sys_class_name=cmdb_ci_business_app^ORchild.sys_class_name=service_offering^ORchild.sys_class_nameINSTANCEOFcmdb_ci_service");
	gr.query();

	while (gr.next()) {
		var childName = gr.getDisplayValue('child');
		var childId = gr.getValue('child');
		if (addedCIs[childId]) {
			continue;
		}
		var childClassName = gr.child.sys_class_name;
		var childOfferType = gr.child.service_classification;
		var childNode = {"id": childId, "label": childName, "actionable": true, "children":[]};
		if (childClassName == 'cmdb_ci_business_app') {
			result.tree[0].children.push(childNode);
			addedCIs[childId] = true;
		} else if (childClassName == 'service_offering' && childOfferType == 'Business Service') {
			result.tree[1].children.push(childNode);
			addedCIs[childId] = true;
		} else if (childClassName == 'service_offering' && childOfferType == 'Technical Service') {
			result.tree[2].children.push(childNode);
			addedCIs[childId] = true;
		} else if (childOfferType == 'Application Service') {
			result.tree[3].children.push(childNode);
			addedCIs[childId] = true;
		}
	}
	
	var assocGr = new GlideRecord('svc_ci_assoc');
	assocGr.addQuery('ci_id', recordId);
	assocGr.query();
	while (assocGr.next()) {
		var assocServiceId = assocGr.getValue('service_id');
		if (addedCIs[assocServiceId] || assocServiceId === recordId) {
			continue;
		}
		var assocServiceName = assocGr.getDisplayValue('service_id');
		var assocNode = {"id": assocServiceId, "label": assocServiceName, "actionable": true, "children":[]};
		result.tree[3].children.push(assocNode);
		addedCIs[assocServiceId] = true;
	}
	
	result.expanded = [];
	for (var i = result.tree.length - 1; i >= 0; i--) {
		// If there are no relationships of this type, remove the group from the tree
		if (result.tree[i].children.length <= 0) {
			result.tree.splice(i, 1);
		} else { // Otherwise make sure it is expanded on load
			result.expanded.push([result.tree[i].id]);
		}
	}
	
	return result;
}
