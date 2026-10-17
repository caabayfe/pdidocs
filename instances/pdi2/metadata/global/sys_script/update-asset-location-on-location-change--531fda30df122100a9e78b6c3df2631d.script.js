updateAssetLocations();

function updateAssetLocations() {
    var recordSysId = current.getUniqueValue();
    var newLocation = current.getValue('location');
    var oldLocation = previous.getValue('location');

    var script = "var assetGr = new GlideRecord('alm_asset');" +
        "assetGr.addQuery('stockroom', '" + recordSysId + "');" +
        "assetGr.addQuery('location', '" + oldLocation + "');" +
        "assetGr.setValue('location', '" + newLocation + "');" +
        "assetGr.updateMultiple();";

    var jobName = 'Update stockroom assets: ' + recordSysId;
    var isJobAlreadyPresent = global.ModelUtils.submitJobwithDupCheck(jobName, jobName, script, recordSysId);
    if (isJobAlreadyPresent) {
        gs.addErrorMessage(gs.getMessage('Location of assets in this stockroom are being updated. Please try again later'));
        current.setAbortAction(true);
    } else {
        gs.addInfoMessage(gs.getMessage('Job submitted to update location of assets in this stockroom'));
    }
}
