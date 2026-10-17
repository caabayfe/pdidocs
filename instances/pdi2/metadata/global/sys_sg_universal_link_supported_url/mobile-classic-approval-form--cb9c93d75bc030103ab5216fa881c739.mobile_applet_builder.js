/**
 * Initialize the mobile screen builder based on the Mobile Screen Type.
 *
 * List:
 * initListScreen(tableName) or
 * initListScreen(tableName, listQuery)
 *
 * Form:
 * initRecordScreen(tableName, sysId)
 *
 * Browser:
 * initMobileWebScreen(url)
 **/

(function initializeMobileScreenBuilder( /*String*/ urlPath, /*Dictionary*/ urlQuery, /*String*/ originalUrl) {
    var mobileScreenBuilder = new sn_mobile.ScriptableMobileScreenBuilder();

    var pathSegments = urlPath.split("/");
    var sysId = "";
    if (pathSegments.length == 3)
        sysId = pathSegments[2];
    else if (pathSegments.length >= 4)
        sysId = pathSegments[3];

    var approvalGR = new GlideRecord('sysapproval_approver');

    approvalGR.addQuery('sys_id', sysId);
    approvalGR.query();
    if (approvalGR.next()) {
        var tableName = approvalGR.source_table;
        var approvalRefRecord = approvalGR.sysapproval.getRefRecord();
        if (!approvalRefRecord || !approvalRefRecord.isValidRecord())
            return mobileScreenBuilder;

        var recordId = approvalRefRecord.sys_id;
    }

    mobileScreenBuilder.initRecordScreen(tableName, recordId);

    return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
