function showReparentConfirmation() {
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('confirm_reparent_dialog');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    dlg.setWidth(400);
    dlg.setPreference('onOk', function() { 
		extendApplicationFileOnInsert(); 
		dlg.destroy(); 
	});
    dlg.setPreference('onCancel', function() {
		dlg.destroy();
	});

    dlg.render();
	
	return false;
}

function extendApplicationFileOnInsert() {
	var gr = new GlideRecord("sys_db_object");
	gr.addQuery("name","sys_metadata");
	gr.query();
	if(gr.next()) {
		g_form.setValue("super_class",gr.sys_id,"Application File");
	}
}
