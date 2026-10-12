(function overrideView(view, is_list) {
	
    if (new sn_utc.UpgradePlanInstanceTypeAPI().isConsumer())
        answer = 'app_client'; // set the new view to answer
	
})(view, is_list);
