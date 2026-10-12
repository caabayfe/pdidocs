(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// AI Search Assist does not currently support custom actions. This is for internal use only.
	
	var SC_CAT_ITEM_GUIDE = 'sc_cat_item_guide';

	var data = request.body.data;
	var className = data.className;
	var sysId = data.sysId;
	var spOrderLink = '';
	var referrerParam = '&referrer=ai_search_assist';
	if (SC_CAT_ITEM_GUIDE.equals(className))
		spOrderLink = 'id=' + SC_CAT_ITEM_GUIDE;
	else
		spOrderLink = 'id=sc_cat_item';
	spOrderLink = spOrderLink + '&sys_id=' + sysId + referrerParam;
	var result = {
		actionType: 'OPEN_LINK_CURRENT_TAB',
		forceRedirect: false,
		linkValue: spOrderLink
	};
	response.setBody(result);

})(request, response);
