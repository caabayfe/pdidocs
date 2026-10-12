	(function(finding) {
	    var targetProperty = 'glide.script.ui_page.customer_scoped.security_msgs_enabled';
	    var expectedValue = 'true';
	    var propertyValue = gs.getProperty(targetProperty, 'true');

	    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
	        var gr = new GlideRecord('sys_properties');
	        if (gr.get('name', targetProperty)) {
	            finding.setCurrentSource(gr);
	        }
	        finding.increment();
	    }
	})(finding);
