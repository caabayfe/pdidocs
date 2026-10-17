var UserProfileUtil = Class.create();
UserProfileUtil.prototype = {
    initialize: function() {
    },
	
	getProfileURL: function(urlSuffix) {
		var profileURL = 'user_profile';
                var csmProfileURL='user_profile&sys_id='+gs.getUser().getID();
                if(urlSuffix=='csm')
		        return csmProfileURL;
		if (gs.isLoggedIn()) {
			var userClassKey = gs.getUser().getID() + "_userClass";
			var userClass = gs.getSession().getClientData(userClassKey);
			if (!userClass) {
				var sysUserGR = new GlideRecord("sys_user");
				if (sysUserGR.get(gs.getUser().getID())) {
					userClass = sysUserGR.getValue("sys_class_name");
					gs.getSession().putClientData(userClassKey, userClass);
				}
			}
			
			var hasConsumerRole = gs.getUser().hasRole('sn_customerservice.consumer');
			var hasCustomerRole = gs.getUser().hasRole('sn_customerservice.customer');
			var isExternalConsumer = (hasConsumerRole && userClass == 'csm_consumer_user') || (gs.getUser().hasRole('sn_customerservice.unified_consumer') &&  gs.getUser().hasRole('snc_external') && ! gs.getUser().hasRole('snc_internal') && urlSuffix == 'csp');

			if (isExternalConsumer)
				profileURL = 'csp_profile';
			else if (hasCustomerRole && userClass == 'customer_contact')
				profileURL = 'csm_profile';
		}
		return profileURL;
		
    },

    type: 'UserProfileUtil'
};
