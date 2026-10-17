var selectedRowIDs;
var datasetSysID;

function unlinkSelectedConfigBundles() {
    // Alert the user if nothing is selected
    if (g_list.getChecked().length < 1) {
        alert("You have not selected any Config bundles to unlink from this EVAM definition.");
    } else {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();
        selectedRowIDs = g_list.getChecked();
        datasetSysID = g_list.getSubmitValue('sysparm_collectionID');
        var ga = new GlideAjax('global.EvamLinkingService');
        ga.addParam('sysparm_name', 'unlinkConfigBundles');
        ga.addParam('sysparm_dataset_id', datasetSysID);
        ga.addParam('sysparm_bundle_ids', selectedRowIDs);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                loadingDialog.destroy();
                location.reload();
            } else {
                gs.addErrorMessage(gs.getMessage('Sorry, something went wrong while unlinking those Config bundles. Please check the logs or try again later.'));
            }
        });
    }
}
