(function executeRule(current, previous /*null when async*/) {
	var categoryReferenceFieldMap = new global.ContentConfigUtil().getCategoryReferenceFieldMap();
	var contentReferenceFieldMap = new global.ContentConfigUtil().getContentReferenceFieldMap();
	g_scratchpad.contentReferenceFieldMap = contentReferenceFieldMap;
	g_scratchpad.categoryReferenceFieldMap = categoryReferenceFieldMap;
})(current, previous);
