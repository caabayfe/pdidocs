(function executeRule(current, previous /*null when async*/) {
	var SUMMARY_ITEM_NUMBER = 2; 
	var currentList = current.ip_address_list;
	
	//Query at most three ip_address items of the list
	var listGr = new GlideRecord('ip_address_list_item_m2m');
	listGr.addQuery('ip_address_list', currentList);
	listGr.orderBy('sys_created_on');
	listGr.setLimit(3);
	listGr.query();

	var ipNum = 0;
	var summary = [];
	while ((ipNum < SUMMARY_ITEM_NUMBER)  && (listGr.next())) {
		var itemGr = new GlideRecord('ip_address_item');
		if (itemGr.get(listGr.getValue('ip_address_item'))) {
			summary.push(itemGr.getValue('ip_address'));
			ipNum++; 
		}
	}

	var moreListItem = (ipNum < listGr.getRowCount());
	var newSummary = getSummaryFromArray(summary, moreListItem);
	updateListNameSummary(currentList, newSummary);
	
})(current, previous);


/**
 * Update the name and summary of an input ip_address list.   
 *
 * @param list the sys_id of the ip_address list 
 * @param summary the new summary calculated based on the operation
 */
function updateListNameSummary (list, summary) {
	var listGr  = new GlideRecord ('ip_address_list');
	if (listGr.get(list)) {
		var preName = listGr.getValue('name'); 
		var preSummary = listGr.getValue('summary');
		//Summary was not changed
		if (summary == preSummary )
			return;
	
		//Update Summary and name 
		listGr.setValue('summary', summary );
		if (preName == preSummary)
			listGr.setValue('name', summary);
		listGr.update();
		
	}
}

/**
 * Create a string for the summary based on an array of ip_address items as follows
 * d                If there is only one ip_address item d
 * d1,d2            If there are two ip_address items d1, d2
 * d1,d2,...        If there are more than two ip_address items in the list
 *
 * @param ipItems the array of ip_address items 
 * @param moreItem boolean that shows if there are more than two items in the list 
 */

function getSummaryFromArray(ipItems, moreItem) {
	var summary = ipItems.join(',');
	if (moreItem) 
		summary = summary + ',...';
	return summary; 
}
