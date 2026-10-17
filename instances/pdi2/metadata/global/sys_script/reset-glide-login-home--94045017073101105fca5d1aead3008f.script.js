(function executeRule(current, previous /*null when async*/) {
	// When switching Next Experience off, reset the value of glide.login.home
	// back to UI16 default if the value is the Next Experience default
	if(current.getValue('value') === 'false' && previous.getValue('value') === 'true') {
		var before = gs.getSession().getWorkflow();
		gs.getSession().setWorkflow(false);
		
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'glide.login.home');
		gr.query();
		
		gr.next();
		
		if(gr.getValue('value') === '/now/nav/ui/home') {
			gr.setValue('value', 'home_splash.do?sysparm_redirect=true');
			gr.update();
		}
		
		gs.getSession().setWorkflow(before);
	}
})(current, previous);
