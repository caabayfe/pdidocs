var viewId = event.parm1;
var certInfo = JSON.parse(event.parm2);
sn_cmdb_data_manager.CMDBDataManagerScopedScriptableApis.getCertificationView(viewId, certInfo.certTable, certInfo.displayFields, certInfo.certificationFields);
