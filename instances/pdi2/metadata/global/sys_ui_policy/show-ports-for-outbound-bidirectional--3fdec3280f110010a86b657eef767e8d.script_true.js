function onCondition() {
	//g_form.showFieldMsg('use_ports', 'Ports associated with this rule.  A comma-separated list of individual ports or ranges (e.g., 12,20-25,8080).  Empty indicates all ports.', 'info');
	g_form.setDisplay('use_ports', true);
	g_form.setDisplay('use_on_mid', true);
	g_form.setDisplay('ports', g_form.getValue('use_ports') == 'true');	
}
