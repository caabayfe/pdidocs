function onBefore(current, previous) {
	try {
		if (RP.isHomePage())
			return;
		
		if (JSUtil.nil(ListProperties))
			return;
		
		if (JSUtil.nil(ListProperties.getTable()))
			return;
		
		if (ListProperties.getTable() + '' != 'license_details')
			return;
		
		if (ListProperties.isRelatedList())
			return;
			
		if (ListProperties.isEmbeddedList())
			return;
		
		var viewName = ListProperties.getView();
		if (JSUtil.notNil(viewName)) {
			if ((viewName.indexOf("rpt-temp") == 0) || (viewName.indexOf("RPT") == 0))
				return;
		}

		var unmappedTableCount = SNC.CustomTableUtils.getUnmappedTableCount();
		if (unmappedTableCount > 0) {
			var link = SNC.CustomTableUtils.getInventoryURI();
			gs.addInfoMessage(gs.getMessage('warn_user_of_subscription_impact', link));
		}

		gs.addInfoMessage(gs.getMessage('Not all subscription services are monitored and not all of your purchased subscriptions may appear in the list. ') + '<a id="permalink" class="linked" style="color:#666666;" href="/weba_redirect.do?sysparm_url=http://docs.servicenow.com/?context=CSHelp:Subscription-Management-Missing-Subscriptions&sysparm_category=Subscription-List&sysparm_action=More-Info&sysparm_name=Clicked" target="_blank">' + gs.getMessage('More Info') + '</a>');

		if (SNC.UsageAnalyticsScriptUtils.getEntitlementLevel() === 'OFF' && SNC.UsageAnalyticsScriptUtils.isAutoSystemEntitlementEnabled())
			gs.addInfoMessage(gs.getMessage('licensing_per_user_allocation_info'));

	} catch (e) {
	}
	
}
