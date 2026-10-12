function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
    goalFrameworkAjax.addParam('sysparm_name', 'isAtleastOneTargetIsOfNonMilestoneType');
    goalFrameworkAjax.addParam('sysparm_target_sys_ids', sysIDs);

    goalFrameworkAjax.getXML(function(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        callback(!answer['recordOfNonMilestoneType']);
    });

}
