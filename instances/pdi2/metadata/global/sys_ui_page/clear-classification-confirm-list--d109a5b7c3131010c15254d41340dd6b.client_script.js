document.getElementById("ok_button").focus();

function ok() {
   var dictSysIds = "$[sysIds]";
    if (dictSysIds === null || dictSysIds === '')
        return;

    var data = Object.toJSON({
        "dictionary_entries": dictSysIds
    });

    new Ajax.Request('/api/now/data_classification/clear', {
        asynchronous: false,
		requestHeaders: {
            "X-UserToken": top.window.g_ck
        },
        contentType: 'application/json;charset=UTF-8',
        parameters: data,
        onSuccess: function(response) {
            deleteDone();
        },
        onFailure: function() {
            destroyDialog();
        }
    });
    return true;
}

function cancel() {
	destroyDialog();
    return false;
}

function deleteDone() {
	destroyDialog();

	g_navigation.reloadWindow();
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
