function invokePromptCallBack(type) {
    var glideDialogWindow = GlideDialogWindow.get();
	var func;
    if (type == 'ok')
       func = glideDialogWindow.getPreference('onPromptComplete');
    else
       func = glideDialogWindow.getPreference('onPromptCancel');
	
    if (typeof(func) == 'function') {
        try {
			var targetLabel = gel("target_tag").value;
			if(!targetLabel) {
				alert("Please enter a valid tag");
				return false;
			}
			
			func.call(glideDialogWindow, targetLabel);
        } catch(e) {}
    }
	
    glideDialogWindow.destroy();
	return false;
}
