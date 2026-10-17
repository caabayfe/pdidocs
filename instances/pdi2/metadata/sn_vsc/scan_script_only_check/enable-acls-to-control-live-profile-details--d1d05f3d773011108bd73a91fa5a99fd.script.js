(function(finding) {
    var targetProperty = 'glide.live_profile.details';
    var expectedValue = 'ACL';
    var defaultValue = 'ACL';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'glide.live_profile.details');
		gr.query();
		if (gr.next()){
			finding.setCurrentSource(gr);
		}
        finding.increment();
    }
})(finding);
