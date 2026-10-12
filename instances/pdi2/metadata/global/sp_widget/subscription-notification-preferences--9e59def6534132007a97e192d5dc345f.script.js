(function() {
	if(input) {
		//in ideal world, we will not need this
		if (input.action == 'createPrimaryEmailChannel') {
			var currentUser = gs.getUser(),
					cnd = new GlideRecord('cmn_notif_device');
			cnd.addQuery('primary_email', true);
			cnd.addQuery('name', 'Primary Email');
			cnd.addQuery('user', currentUser.getID());
			cnd.query();
			if (!cnd.next()) {
				cnd.initialize();
				cnd.active = true;
				cnd.user = currentUser.getID();
				cnd.email_address = currentUser.getEmail();
				cnd.name = 'Primary Email';
				cnd.type = 'Email';
				cnd.primary_email = true;
				data.new_channel = cnd.insert();
			}
		}
		return;
	}
	
	var liveProfileGR = new GlideRecord("live_profile");
	liveProfileGR.addQuery("document",gs.getUser().getID());
	liveProfileGR.query();

	data.kmPortalUrl = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url');
	data.isCommunityPluginActive = pm.isActive('com.sn_communities');
	data.isIdeaPluginActive = pm.isActive('com.snc.innovation_management');
	data.liveProfileId = "";
	data.portal_default_config = gs.getProperty("sn_communities.portal_default_config") || '';

	if (liveProfileGR.next()) {
		data.liveProfileId = liveProfileGR.getUniqueValue();
	}
	data.config = {
		pageSize: options.page_size ? parseInt(options.page_size): 10
	};
	var actSubCtx = ActivitySubscriptionContext.getContext();
	var subscriptionService = actSubCtx.getSubscriptionService();
	var result = subscriptionService.getUserStream(data.liveProfileId, 'Notification');
	data.fanout_to_stream = (result && result.name == 'Notification') ? result.fanout_to_stream : true;
	data.msg = {
		prefSaved: gs.getMessage('Your Notification Settings have been saved'),
		subscribe: gs.getMessage('Subscribe {0}'),
		unsubscribe: gs.getMessage('Unsubscribe {0}')
	};
	
	//load the modules
	data.modules = [];
	var mod = new GlideRecord('sn_actsub_module');
	mod.addActiveQuery();
	var condition = mod.addQuery('disable_notifications', 'false');
	condition.addOrCondition('disable_notifications', '');
	mod.orderBy('order');
	mod.query();
	while (mod.next()) {
		if (mod.canRead()) {
			var module = {};
			module.name = mod.getDisplayValue('name');
			module.sys_id = mod.getUniqueValue();
			data.modules.push(module);
		}
	}

})();
