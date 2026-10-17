var SendToSelfConfigurationUtilSNC = Class.create();
	SendToSelfConfigurationUtilSNC.prototype = {
		initialize: function() {
		},

		/**
		 * Returns if there's an already existing active Send to self configuration record present
		 * @param {String} sysId - sys_id of the portal
		 * returns {Boolean} - if the record is present
		 */
		checkIfDuplicateConfigRecord: function(portal, domain, sys_id) {
			var gr = new GlideRecord('sn_ex_sp_send_self_configuration');
			gr.addQuery('portal', portal);
			gr.addQuery('sys_domain', domain);
			if(sys_id)
				gr.addQuery('sys_id', '!=', sys_id);
			gr.addActiveQuery();
			gr.setLimit(1);
			gr.query();
			return gr.hasNext();
		},

		type: 'SendToSelfConfigurationUtilSNC'
	};
