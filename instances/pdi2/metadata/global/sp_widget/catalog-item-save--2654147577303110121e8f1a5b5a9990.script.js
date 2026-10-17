(function() {
    data.isMEE = options.native_mobile == 'true';
    data.draftName = options.draftName;
    data.modalMessage = options.message;
	data.modalInfoMessage = options.infoMessage;

    var m = data.msgs = {};
    m.saveDraft = gs.getMessage("Save draft");
    m.closeModal = gs.getMessage("Close modal");
    m.cancel = gs.getMessage("Cancel");
    m.save = gs.getMessage("Save");
    m.label = gs.getMessage("Save draft as");
    m.maxLengthExceededMsg = gs.getMessage("Draft Item name should not exceed 200 characters.");
    m.mandatoryMessage = gs.getMessage("Draft Item name should not be empty.");

    data.sys_properties = {
        mobileNativeColor: gs.getProperty("glide.sc.mobile.primary_color", "#1f8476"),
        isPolaris: gs.getProperty("glide.ui.polaris.experience", "false")
    };

})();
