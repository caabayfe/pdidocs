answer = JSON.stringify(constructMIDConfig("mid.windows.management_protocol"));

function isEmptyOrBlank(str) {
    return (!str || (0 === str.length) || (/^\s*$/.test(str)));
}

function constructMIDConfig(parameterName) {

    // -------------------- user defined criteria --------------------

    var counterMap = {
        "default_count": 0,
        "explicit_wmi_count": 0,
        "explicit_winrm_count": 0,
        "other_value_count": 0
    };

    function updateCountersAndReturnString(value) {
        var lower = value.toLowerCase();
        if (isEmptyOrBlank(lower))
            ++counterMap["default_count"];
        else if (lower == "wmi")
            ++counterMap["explicit_wmi_count"];
        else if (lower == "winrm")
            ++counterMap["explicit_winrm_count"];
        else 
            ++counterMap["other_value_count"];
        
        return value + "";
    }

    // ---------------------------------------------------------------

    var result = {};
    var TABLE_ECC_AGENT = "ecc_agent";
    var TABLE_ECC_AGENT_PROPERTY = "ecc_agent_property";
    var TABLE_ECC_AGENT_CONFIG = "ecc_agent_config";

    if (!GlideTableDescriptor.isValid(TABLE_ECC_AGENT))
        return result;

    if (!GlideTableDescriptor.isValid(TABLE_ECC_AGENT_CONFIG))
        return result;

    if (!GlideTableDescriptor.isValid(TABLE_ECC_AGENT_PROPERTY))
        return result;

    function getMIDConfigForSpecificMid(midRecord) {
        var target = new GlideRecord(TABLE_ECC_AGENT_CONFIG);
        target.addQuery("ecc_agent", midRecord.sys_id);
        target.addQuery("param_name", parameterName);
        target.query();
        if (target.next())
            return target.value.toString();
        else
            return "";
    }

    function updatePropertiesForAllMIDs(arrayOfMIDs, valueToBeOverridden, midSet) {
        var overrideValue = !isEmptyOrBlank(valueToBeOverridden);
        var midRecords = new GlideRecord(TABLE_ECC_AGENT);
        midRecords.query();
        while (midRecords.next()) {
            var config = {};
            var midName = midRecords.getDisplayValue();
            var midAlreadyHasValue = Object.prototype.hasOwnProperty.call(midSet, midName);
            if (!midAlreadyHasValue) {
                config["name"] = midName;
                var propertyValue = overrideValue ? valueToBeOverridden : getMIDConfigForSpecificMid(midRecords);
                config[parameterName] = updateCountersAndReturnString(propertyValue);
                arrayOfMIDs.push(config);
            }
        }
    }

    function getMIDAgentProperties() {
        var valueToBeAppliedToAllMIDs = "";
        var arrayOfMIDs = [];
        var midsAlreadyProcessed = {};

        var agentProperty = new GlideRecord(TABLE_ECC_AGENT_PROPERTY);
        agentProperty.addQuery("name", parameterName);
        agentProperty.query();
        while (agentProperty.next()) {
            var resultMap = {};
            // if a record with specific MID exists
            if (!agentProperty.ecc_agent.isNil()) {
                var name = agentProperty.ecc_agent.getDisplayValue();
                midsAlreadyProcessed[name] = true;
                resultMap["name"] = name;
                resultMap[parameterName] = updateCountersAndReturnString(agentProperty.value.toString());
                arrayOfMIDs.push(resultMap);
            } else
                // agent property record for all mids exist
                valueToBeAppliedToAllMIDs = agentProperty.value.toString();
        }
        updatePropertiesForAllMIDs(arrayOfMIDs, valueToBeAppliedToAllMIDs, midsAlreadyProcessed);

        return arrayOfMIDs;
    }

    // datastructure to hold the mid config mappings
    var arrayOfMappings = getMIDAgentProperties();
    result["mid_config"] = arrayOfMappings;
    Object.keys(counterMap).forEach(function(key) {
        result[key] = counterMap[key];
    });
    result["count"] = arrayOfMappings.length;

    return result;
}
