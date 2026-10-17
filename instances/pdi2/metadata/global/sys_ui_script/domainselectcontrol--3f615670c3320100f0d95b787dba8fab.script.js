var DomainSelectControl = Class.create();

DomainSelectControl.prototype = Object.extendsObject(WelcomeWidgetSelectControl, {
       initialize: function($super, span_name, roles, fillFunction, changeFunction) {
		    $super(span_name, roles, fillFunction, changeFunction);
			CustomEvent.observe('glide:ui_notification.session_change', this.updateWidgetForSessionChange.bind(this));
			CustomEvent.observe('record.domain', this.updateWidgetForRecordChange.bind(this));
	   },
	
	    updateWidgetForSessionChange: function(sessionDomain) {
			if (typeof(sessionDomain.xml.dataset) != 'undefined') {
    			this.updateWidgetForChange(sessionDomain.xml.dataset.attrSession_domain, 'true');
			}
    	},
	
	    updateWidgetForRecordChange: function(sessionDomain) {
    		this.updateWidgetForChange(sessionDomain, 'false');
    	},

    	updateWidgetForChange: function(sessionDomain, sessionChange) {
			if (this.span != null && this.span.style.visibility == "hidden")
				return; //Do nothing if the widget is not visible
			
			if (sessionDomain == null || sessionDomain.length == 0)
				return;
			
        	var selectedDomainObject = this.select.options[this.select.selectedIndex];
        	var selectedDomain = selectedDomainObject.getAttribute('data-label');

        	if (selectedDomain && selectedDomain.length != 0 && selectedDomain != sessionDomain)
            	this.fillWidgetWithChange(selectedDomain, sessionDomain, sessionChange);		
    	},

	    /**
		 * Domain select and session domain are not in sync. Notify the user about the change
         */
    	fillWidgetWithChange: function(selectedDomain, sessionDomain, sessionChange) {
        	var ga = new GlideAjax('UIPage');
        	ga.addParam('sysparm_name','fillWidget');
        	ga.addParam('sysparm_domain_change','true');
        	ga.addParam('sysparm_session_change',sessionChange);
        	ga.addParam('sysparm_old_domain',selectedDomain);
        	ga.addParam('sysparm_new_domain',sessionDomain);
        	ga.addParam('sysparm_function_select',this.fillFunction);
        	ga.getXML(this.fillWidgetResponse.bind(this));
    	}

});
	
