function confirmReparentTableToApplicationFile(tableName) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('confirm_reparent_dialog');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    dlg.setWidth(400);
    dlg.setPreference('onOk', doReparentSubmit);
    dlg.setPreference('onCancel', function(){dlg.destroy();});
    
    dlg.render();
	
	return false;
}

function doReparentSubmit() {
	gsftSubmit(null, g_form.getFormElement(), 'extend_appfile'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
	reparentTableToApplicationFile(current.name);

function reparentTableToApplicationFile(tableName) {
	SNC.TableEditor.reparentTableToApplicationFile(tableName);
}
