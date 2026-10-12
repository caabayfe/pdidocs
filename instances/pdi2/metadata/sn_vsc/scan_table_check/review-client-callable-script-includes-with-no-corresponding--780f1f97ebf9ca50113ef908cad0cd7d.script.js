(function (finding, current) {
    var gr_acl = new GlideRecord('sys_security_acl');
		gr_acl.addQuery('type','client_callable_script_include');
		gr_acl.addQuery('name','CONTAINS',current.name);
		gr_acl.query();
		if(!gr_acl.next()){
			finding.setCurrentSource(current);
			finding.setValue('finding_details', 'The Client Callable Script Include "' + current.name + '" does not have a corresponding ACL.');
			finding.increment();
		}

})(finding, current);
