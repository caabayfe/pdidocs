
            var gdw = GlideModal.get();

// ---- get preferences ---
var onPromptComplete = gdw.getPreference('onPromptComplete');
var onPromptCancel = gdw.getPreference('onPromptCancel');

function invokeCompleteCallBack() {
    onPromptComplete();
    gdw.destroy();
}

function invokeCancelCallBack() {
	onPromptCancel();
    gdw.destroy();
}
