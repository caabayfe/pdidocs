function confirmAndSubmitForm() {
    if (g_scratchpad.shouldShowUpgradeConfirmationDialog) {
        showDialogForRiskyFiles(); // This method is present in Client Callable "ShowConfirmUpdateDialog". 
    } else {
        proceedWithUpdateFromForm();
    }
}

// Save and redirect to previous URL. Do not change this name as it is being used/called at several places. 
function proceedWithUpdateFromForm() {
    gsftSubmit(null, g_form.getFormElement(), 'sysverb_update');
}

// This is to perform update on server-side (where window is undefined), when request is initiated from client side. 
if (typeof window == 'undefined')
    doUpdate();

// Server-side function to update the current record and navigate as necessary
function doUpdate() {
    current.update();
}
