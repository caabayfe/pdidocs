(function executeRule(current, previous /*null when async*/) {
	var maxRememberedBrowserCount = GlideProperties
				.getInt("glide.authenticate.multifactor.remembered.browser.max.count", 5);
	var gr = new GlideAggregate("multi_factor_browser_fingerprint");
	gr.addAggregate("COUNT");
	gr.addQuery("user", current.user);
	gr.query();
	if(gr.next()){
		var rememberedBrowserCount = gr.getAggregate("COUNT");
		if(maxRememberedBrowserCount < rememberedBrowserCount){
			var bfpGr = new GlideRecord("multi_factor_browser_fingerprint");
			bfpGr.addQuery("user", current.user);
			bfpGr.orderBy("sys_created_on");
			bfpGr.query();
			while (bfpGr.next() && (maxRememberedBrowserCount < rememberedBrowserCount)) {
				bfpGr.deleteRecord();
				rememberedBrowserCount--;
				gs.info("User can only remember upto " + maxRememberedBrowserCount
						+ " browsers. Removed oldest remembered browser for user : " + current.user);
			}	
		}
	}
})(current, previous);
