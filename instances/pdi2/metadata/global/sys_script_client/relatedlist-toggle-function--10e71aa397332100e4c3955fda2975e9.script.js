/**
 * Previous version of this client script hid all related lists and then selectively
 * showed certain related lists depending on the discovery type of the schedule.
 * Now, we show all related lists and then hide related lists that should not be shown.
 * The business rule "Generate Related Lists" defines which related lists should be
 * shown with each discovery type.
 */
function onLoad() {
	window.showHideRelatedLists = function(discover) {
		g_form.showRelatedLists();

		if (discover == 'Cloud' || discover == 'Hostless')
			g_form.setSectionDisplay('advanced', false);
		else
			g_form.setSectionDisplay('advanced', true);

		// g_scratchpad data is populated from "Generate Related Lists" business rule
		var showKey = g_scratchpad.mapDiscoverToListKey[discover];
		// if no key is found for this discovery type, default to showing autoSched or host
		if (!showKey)
			showKey = (g_form.getBooleanValue('quick_start')) ? 'autoSched' : 'host';

		var showList = g_scratchpad.relatedLists[showKey];
		var allSet = g_scratchpad.all;
		
		//Hide/show the 'Certificate URLs' tab, if dicovery is certificates and it's discovery type is 'URL'
		if (discover == 'Certificates') {
			var hideCertificateList = (g_form.getValue('cert_discovery_type') == 'url') ? 'discovery_ptrn_hostless_lchr.schedule' : 'sn_disco_certmgmt_cert_url_sched_m2m.schedule';

			if (hideCertificateList) {
				var showLists = [];
				for (var j = 0; j < showList.length; j++) {
					if (showList[j] != hideCertificateList)
						showLists.push(showList[j]);
				}
				showList = showLists;
			}
		}

		// hideSet = allSet - each RL in showList
		// deep copy all into hideSet, then remove from hideSet
		var hideSet = Object.assign({}, allSet);
		for (var i = 0; i < showList.length; i++)
			delete hideSet[showList[i]];
		
		// convert the hide set to a list so that we can iterate
		var hideList = Object.keys(hideSet);
		hideRelatedList(hideList);

		//Reason for calling the 'setTimeout' method -> Tabs hide/show is improper while page is on loading. The reason is  scopped app UI policies and client script execution time is conflict. So resolving this issue, just put few millisecond time delay for hiding the required tabs.
		function hideRelatedList(hideList) {
			window.setTimeout(function() {
				for (var i = 0; i < hideList.length; i++)
					g_form.hideRelatedList(hideList[i]);
			}, 100);
		}
	};
	
	window.showHideRelatedLists(g_form.getValue('discover'));
}
