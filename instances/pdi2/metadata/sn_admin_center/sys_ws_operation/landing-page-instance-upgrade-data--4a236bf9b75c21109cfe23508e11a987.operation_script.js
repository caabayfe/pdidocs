(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result;

    var endOfLife = 'N/A';
    var scheduledVersion = 'N/A';
    var scheduledOn = 'N/A';
    var upgradeGR = new GlideRecord('upgrade_center_metadata');
    upgradeGR.query();
    if (upgradeGR.next()) {
        endOfLife = upgradeGR.getValue('near_end_of_life') == 1 ? 'Yes' : 'No';

        if (global.JSUtil.notNil(upgradeGR.getValue('scheduled_version'))) {
            scheduledVersion = getVersionName(upgradeGR.getValue('scheduled_version'));
            scheduledOn = upgradeGR.getValue('upgrade_scheduled_on');
        }
    }

    function getVersionName(version) {
        var gr = new GlideRecord('upgrade_preview_version');
        gr.addQuery('value', version);
        gr.query();
        gr.next();

        return gr.getDisplayValue('label');
    }


    result = {
        currentReleaseVersion: new GlideUpgradeUtil().getCurrentBuildName(),
        endOfLife: endOfLife,
        scheduledVersion: scheduledVersion,
        scheduledOn: scheduledOn
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
