const scriptName = "Fix script: EM - mixed grouping DB changes";
var addIconsLogMsg = scriptName + ":\n\nAdd missing icon group to em_agg_group\n\n";

function addMissingIconGroupToEmAggGroup() {
    const scriptGR = new GlideRecord('sys_dictionary');
    scriptGR.addQuery('name', 'em_agg_group');
    scriptGR.addQuery('element', 'icon');
    scriptGR.query();
    if (!scriptGR.next()) {
        addIconsLogMsg += "ERROR: Could not find the record, no action was taken";
        gs.error(addIconsLogMsg);
        return;
    }
    const groupsToCheck = {
        11: 'Tag Cluster',
        12: 'Network Traffic',
        13: 'Mixed'
    };
    const originalScript = scriptGR.getValue('calculation');

    // main logic - helper function
    const updatedScript = _addMissingIconGroup(originalScript, groupsToCheck);

    if (originalScript === updatedScript) {
        addIconsLogMsg += "NOTE: The calculated value for the icon field in em_agg_group is already configured. No action was taken";
        gs.info(addIconsLogMsg);
        return;
    }

    scriptGR.setValue('calculation', updatedScript);

    if (scriptGR.update()) {
        addIconsLogMsg += "Updated the record successfully";
        gs.info(addIconsLogMsg);
    } else {
        addIconsLogMsg += "ERROR: There was an error saving the changes!";
        gs.error(addIconsLogMsg);
    }
}

/*
Helper function to add missing icon numbers from groupsToCheck to the originalScript (only logic, no DB)

originalScript example:
	"(function calculatedFieldValue(current) {var sourcesWithIcon = [1,2,3,4,7,8,9,11,12]; if (sourcesWithIcon.indexOf(parseInt(current.source, 10))>=0) { return 'b23997017353101001971e57faf6a7f8'; } return ''; })(current);"
*/
function _addMissingIconGroup(originalScript, groupsToCheck) {
    const SPLIT_CHARS = '];';
    const splitScript = originalScript.split(SPLIT_CHARS);
    var groupsToUpdateArgument = splitScript[0]; // from example: (function calculatedFieldValue(current) {var sourcesWithIcon = [1,2,3,4,7,8,9,11,12

    for (var groupNumber in groupsToCheck) {
        if (!groupsToUpdateArgument.includes(groupNumber)) {
            addIconsLogMsg += groupsToCheck[groupNumber] + " is not configured - Adding now\n";
            if (!groupsToUpdateArgument.endsWith(','))
                groupsToUpdateArgument += ','; // Append a comma if it doesn't exist
            groupsToUpdateArgument += groupNumber;
        }
    }

    groupsToUpdateArgument += SPLIT_CHARS; // Add back the part that was removed during the split action
    const finalScript = groupsToUpdateArgument + splitScript[1]; // Connecting the 2 parts

    return finalScript;
}

// -----------------------------------------
// global variables for logic order change
var logicOrderLogMsg = scriptName + ":\n\nUpdate logic order property, generate default CMDB definition(zboot), delete CMDB correlation property(zboot)\n\n";
var logicOrderErrorStatus = false;

// activate default CMDB configuration
function _activateDefaultCmdbDefinition() {
    const TAG_DEFINITION_TABLE = 'sn_em_tbac_alert_clustering_definitions';
    const DEFAULT_CMDB_DEFINITION_ID = "0dd3cb75eb906210e98a3db55752289e";

    const tagDefinitionGR = new GlideRecord(TAG_DEFINITION_TABLE);
    tagDefinitionGR.addQuery('sys_id', DEFAULT_CMDB_DEFINITION_ID);
    tagDefinitionGR.query();

    if (!tagDefinitionGR.isValid() || !tagDefinitionGR.next()) {
        logicOrderLogMsg += "NOTE: Default CMDB definition doesn't exists\n";
        return;
    }

    if (tagDefinitionGR.getBooleanAttribute('active')) {
        logicOrderLogMsg += "NOTE: Default CMDB definition was already activated";
        return;
    }

    tagDefinitionGR.setWorkflow(false);
    tagDefinitionGR.setValue('active', true);

    if (tagDefinitionGR.update()) {
        logicOrderLogMsg += "Default CMDB definition has been activated\n";
    } else {
        logicOrderLogMsg += "ERROR: failed to activate default CMDB definition\n";
        logicOrderErrorStatus = true;
    }
}

function _getUpdatedLogicOrderPropValueForUpgradingCustomers(propValue) {
    return propValue.replace("TAG_BASED", "MIXED");
}

function _getLogicOrderPropValueForZbootCustomers() {
    return "MIXED,NETWORK_TRAFFIC,PATTERN,GENERALIZED_PATTERNS,TEXTBASE";
}
 
function _handleZbootCustomerAndReturnUpdatedOrderProperty() {
    _activateDefaultCmdbDefinition();
    _deleteCmdbCorrelationProperty();

    return _getLogicOrderPropValueForZbootCustomers();
}

// delete property sa_analytics.agg.query_cmdb_correlation_enabled - also cascade delete related records to remove CMDB option from "Alert Correlation Properties" page
function _deleteCmdbCorrelationProperty() {
    const propName = "sa_analytics.agg.query_cmdb_correlation_enabled";
    const cmdbPropGR = new GlideRecord("sys_properties");
    cmdbPropGR.addQuery("name", propName);
    cmdbPropGR.query();

    if (cmdbPropGR.next()) {
        cmdbPropGR.deleteRecord();
        logicOrderLogMsg += "CMDB correlation property has been deleted\n";
    } else {
        logicOrderLogMsg += "NOTE: CMDB correlation property was not found\n";
    }
}

function _printLogicOrderLogs() {
    if (logicOrderErrorStatus) {
        logicOrderLogMsg += "\nERROR: There has been an error running the script!\n";
        gs.error(logicOrderLogMsg);
    } else {
        logicOrderLogMsg += "\nScript finished successfully!\n";
        gs.info(logicOrderLogMsg);
    }
}

function changeLogicOrderAndHandleCmdbForZboot() {
    const evtCommons = new global.EvtMgmtCommons();
    const propName = "sa_analytics.agg.query.group_logic_order";
    const propGR = new GlideRecord("sys_properties");
    var newPropValue;

    propGR.addQuery("name", propName);
    propGR.query();

    if (propGR.next()) {
        const originalPropValue = propGR.getValue("value");
        logicOrderLogMsg += "Original logic order value: " + originalPropValue + "\n";

        if (evtCommons.isNewInstance()) {
            logicOrderLogMsg += "New (zboot) customer is detected\n";
            newPropValue = _handleZbootCustomerAndReturnUpdatedOrderProperty();
        } else {
            logicOrderLogMsg += "Upgrading customer detected\n";
            newPropValue = _getUpdatedLogicOrderPropValueForUpgradingCustomers(originalPropValue);
        }

        if (originalPropValue === newPropValue) {
            logicOrderLogMsg += "NOTE: logic order property is already updated\n";
        } else {
            propGR.setValue("value", newPropValue);

            if (propGR.update()) {
                logicOrderLogMsg += "Logic order property has been updated to: " + newPropValue + "\n";
            } else {
                logicOrderLogMsg += "ERROR: there has been an error updating logic order property with the following value: " + newPropValue + "\n";
                logicOrderErrorStatus = true;
            }
        }
    }
    _printLogicOrderLogs();
}

addMissingIconGroupToEmAggGroup();
changeLogicOrderAndHandleCmdbForZboot();
