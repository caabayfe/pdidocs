(function (finding) {
	var admin_role = '2831a114c611228501d4ea6c309d626d';

	var gr = new GlideRecord('sys_user_role_contains');
	gr.addQuery('contains', admin_role);
	gr.query();
	while(gr.next()) {
		finding.setCurrentSource(gr);
		gr.setValue('finding_details', 'The role "' + gr.getDisplayValue('role')
			+ '" contains the admin role. Any user that is assigned this role is granted admin privileges.');
		finding.increment();
	}
})(finding);
