check();
function check() {
    if (gs.nil(current.name.trim()))
        errorAndAbort('Name should not be empty');
    if (current.active == true) {
        if (current.operation() === "update" && current.connector_definition.name == "SCOM") {
            var connectorVal = new GlideRecord("em_connector_instance_value");
            connectorVal.addQuery("connector_instance", current.sys_id);
            connectorVal.addQuery("name", "scom_version");
            connectorVal.query();
            var isDefined = 0;
            if (connectorVal.next()) {
                var allowedVersions = ["2007", "2012", "2016", "2019", "2022", "2025"];
                if (allowedVersions.includes(connectorVal.getValue("value"))) {
                    isDefined = 1;
                }
            }
            if (isDefined == 0)
                errorAndAbort("SCOM version is not defined or invalid");
        }
    }

    // Validate connector instance name to be unique across pull and push connectors
    // This validation should happen in two cases: 
    // 	- When the connector instance name changes
    //	- In case of old connector instances, push connector instance could have same name and when user try to set assignment group to the instance, name should be validated.
    //  - When "Insert and Stay" option is selected then current.name.changes() is false, when the name is unchanged and duplicate connector instance with same name is getting created, DEF0557615- fix to check for duplicate name when operation is insert as part of "Insert and Stay"
    if ( current.operation() === "insert" || current.name.changes() || current.assignment_group.changes()) {

        var sysId = current.sys_id ? String(current.sys_id) : null;
        var currentDomain = current.sys_domain ? String(current.sys_domain) : gs.getSession().getCurrentDomainID();

        var connectorInstanceUtil = new ConnectorInstanceUtil();
        var existingInstance = connectorInstanceUtil.findPullConnectorInstanceByNameAcrossDomain(current.name);
        if (existingInstance && existingInstance['sysId'] !== sysId) {
            abort(existingInstance.domain, currentDomain);
            return;
        }

        // For bi-directional connector to work, corresponding push and pull connector instances must have same name.
        // In case of bi-directional pull connector, allow duplicate name only when existing connector instance is push connector instance.
        if (current.bi_directional)
            return;

        existingInstance = connectorInstanceUtil.findPushConnectorInstanceByNameAcrossDomain(current.name);
        if (existingInstance) {
            abort(existingInstance.domain, currentDomain);
        }
    }

    function abort(existingInstanceDomain, currentDomain) {
        var errMessage = gs.getMessage("Pull or Push connector instance with same name already exist. Please specify different name.");
        if (existingInstanceDomain !== currentDomain)
            errMessage = gs.getMessage("Pull or Push connector instance with same name already exist in a different domain. Please specify a different name that is unique across all domains.");
        errorAndAbort(errMessage);
    }

    function errorAndAbort(errMsg) {
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
}
