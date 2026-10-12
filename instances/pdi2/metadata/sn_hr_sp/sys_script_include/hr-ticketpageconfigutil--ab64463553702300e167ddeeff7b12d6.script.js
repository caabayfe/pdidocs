var hr_TicketPageConfigUtil = Class.create();
hr_TicketPageConfigUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor,{
	
	 ESC_PORTAL_CONFIG : "sn_hr_sp_esc_portal_config",
	
	
	// Method returns sys id (string) of the portal marked as active
	// else returns null
	// @deprecated since rome release
	 getActivePortal: function() {
		var gr = new GlideRecord(this.ESC_PORTAL_CONFIG);
		 if(gr.canRead() && gr.get("active", true)) 
			 return '' + gr.portal;
		  else 
			 return null;
	 },
	
	// Method returns URL Suffix of the portal
	// else returns null
	// @deprecated since rome release
	 getActivePortalURLSuffix: function() {
		var gr = new GlideRecord(this.ESC_PORTAL_CONFIG);
		if(gr.canRead()){ 
		 if(gr.get("active", true)) 
			 return '' + gr.portal.url_suffix;
		  else 
			 return 'hrportal';
		}
	 },
	
	// Method returns sys id (string) of the ticket page
	// return null if active portal is not ESC (in case of an upgrade)
	// @deprecated since rome release
	 getActiveTicketPageSysId: function() {
		var gr = new GlideRecord(this.ESC_PORTAL_CONFIG);
		gr.addQuery("active", true);
		gr.query();
		if(gr.canRead() && gr.next()) 
			return '' + gr.page;
		else 
			return null;
	 },
	
	// Method returns id (string) of the ticket page
	// returns null if active portal is not ESC (in case of an upgrade)
	// @deprecated since rome release
	 getActiveTicketPageId: function() {
		var gr = new GlideRecord(this.ESC_PORTAL_CONFIG);
		gr.addQuery("active", true);
		gr.query();
		if(gr.canRead() && gr.next()) 
			return '' + gr.page.id;
	    else 
			return null;
	 },

    type: 'hr_TicketPageConfigUtil'
});
