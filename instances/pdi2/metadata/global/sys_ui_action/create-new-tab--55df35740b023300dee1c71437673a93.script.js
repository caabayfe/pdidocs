function openDialog() { 
	var sysId = g_form.getUniqueValue();
	var modalForm = new GlideModalForm('Navigation Tab Map', 'sys_sg_navigation_tab_map');
	modalForm.setOnloadCallback(function(dialog) {	   
		var form = window.frames.dialog_frame.g_form;
        form.setValue('navigation', sysId);
	});
	modalForm.setCompletionCallback(function(dialog) {
		window.location.reload(true);
	});
    modalForm.render();
}
