function onLoad() {
	var originalField = gel('sys_original.vtb_board.field').value
	CustomEvent.observe('getTableColumnsResponse.received', function() {
		g_form.addOption('field', '__KANBAN__', '-- Kanban Board --');
		
		if (originalField == '__KANBAN__') {
			g_form.setValue('field', '__KANBAN__');
		}
	});
}
