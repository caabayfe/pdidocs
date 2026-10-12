(function executeQuery(v_table, v_query) {
	var qryParent = v_query.getParameter('parent') || "";
	var knowledgeUtil = new global.KBKnowledge();

	var fetchAll = "false";
	var childCategories = [];
	var childCategoriesMap = {};
	var parentIDs = qryParent;
	var kcat = new GlideRecord("kb_category");
	kcat.addActiveQuery();
	if (qryParent)
		kcat.addQuery("parent_id", parentIDs);
	else {
		var portalKBs = knowledgeUtil.getServicePortalKnowledgeBases("mesp") || [];
		var accessibleKBs = knowledgeUtil.getReadableKnowledgeBaseIDs(portalKBs.join()) || "";
		kcat.addQuery("parent_table", "kb_knowledge_base");
		kcat.addQuery("parent_id", "IN", accessibleKBs);
		parentIDs = accessibleKBs;
		fetchAll = "true";
		var initOffset = v_query.getFirstRowWanted() || 0;
		kcat.setLimit(1000 + initOffset);
	}
	kcat.orderBy("label");
	kcat.setCategory("list");
	kcat.query();
	while (kcat.next()) {
		if (kcat.label) {
			childCategories.push(kcat.getUniqueValue() + '');
			childCategoriesMap[kcat.getUniqueValue() + ''] = kcat.getDisplayValue("label") + "";
		}
	}

	var categoriesData = knowledgeUtil.getCategoriesAccessInfo(parentIDs, childCategories.join(), fetchAll, v_query.getLastRowWanted() || 20);
	var filteredChildCategories = categoriesData.accessibleChilds;

	filteredChildCategories.forEach(function(category){
		if(category){
			var rec = {};
			rec.label = convertToString(childCategoriesMap[category]);
			rec.order = "0";
			rec.has_child = categoriesData.onlyChilds && categoriesData.onlyChilds.indexOf(category+'') != -1 ? "false" : "true";
			rec.sys_id = convertToString(category);
			if(qryParent)
				rec.parent = convertToString(qryParent);

			v_table.addRow(rec);
		}
	});

	//Check if it has articles
	if (categoriesData.parentHasArticle){
			var otherRec = {};
			otherRec.label = gs.getMessage("Other");
			otherRec.order = "1";
			otherRec.has_child = "false";
			otherRec.sys_id = convertToString(qryParent);
			otherRec.parent = convertToString(qryParent);
			v_table.addRow(otherRec);
	}

	function convertToString(str){
		if(str)
			return str.toString();

		return "";
	}
})(v_table, v_query);
