function onLoad() {
	//This script changes the type field of the table based on the view
    var view = g_form.getViewName();
    if (view == 'Workspace_Email'){
        g_form.setValue('type', 'Email');
		g_form.setReadOnly('type', true);
	}
    else if (view == 'Workspace_SMS'){
        g_form.setValue('type', 'SMS');
		g_form.setReadOnly('type', true);
	}
    else if (view == 'Workspace_IM'){
        g_form.setValue('type', 'Instant Message');
		g_form.setReadOnly('type', true);
	}
    else if (view == 'Workspace_Voice'){
        g_form.setValue('type', 'Voice');
		g_form.setReadOnly('type', true);
	}
}
