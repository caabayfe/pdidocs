function onCondition() {
	g_form.hideFieldMsg('ports', false);
	g_form.showFieldMsg('ports', 'Ports only apply to outbound rules for Bidirectional.', 'info');
}
