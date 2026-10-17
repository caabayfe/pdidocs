function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    var saveAndClose = true;
    //Type appropriate comment here, and begin script below
    var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
    goalFrameworkAjax.addParam('sysparm_name', 'doesTargetContainProgress');
    goalFrameworkAjax.addParam('sysparm_target_sys_ids', sysIDs);

    goalFrameworkAjax.getXML(function(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        if (answer && answer['hasProgressRecord']) {
            callback(false);
        } else
            callback(true);


    });


}
