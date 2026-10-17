/** @type {{idList: string[]}} */
var allCisInGroup = JSON.parse(sn_cmdbgroup.CMDBGroupAPI.getAllCI(current.cmdb_group));
var amountOfCisInGroup = allCisInGroup.idList.length;
if (amountOfCisInGroup <= (Number(gs.getProperty('sa.qbs.max_cis_for_manual_update', '50000')) || 50000)) {
    var qbsManager = new SNC.QueryBasedServiceManager();
    qbsManager.updateSvcAssoc(current.sys_id);
} else {
    gs.addErrorMessage(gs.getMessage("The number of CIs exceeds the limit, so svc_ci_assoc was not updated."));
}
