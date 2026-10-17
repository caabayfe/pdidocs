gel('prompt_1').focus();

function validateAndSubmit() {
	gel('prompt_for_input_error').innerHTML = '';
	var data = gel('prompt_1').value;
    return invokeCallBack( GlideDialogWindow.get(), data );
}

function invokeCallBack(gdw, data) {
    var cbf = gdw.getPreference('onPromptComplete');
    if (typeof(cbf) != 'function') 
        return false;

    try {
        var ret = cbf.call(gdw, data);
		if ('ok' == ret) {
		    gdw.destroy();
			return false;//true;
		}
		gel('prompt_for_input_error').innerHTML = ret;
        return false;
    } catch (e) {
		alert('e:' + e);
   }
}
