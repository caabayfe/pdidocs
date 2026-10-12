answer = JSON.stringify(constructMIDConfig("mid.ssh.use_snc"));

function isEmptyOrBlank(str) {
    return (!str || (0 === str.length) || (/^\s*$/.test(str)));
}

function constructMIDConfig(parameterName) {

    // --------------- user defined criteria ----------------------------

    var counterMap = {
        // where mid.ssh.use_snc is blank or empty
        "default_count": 0,
        // where mid.ssh.use_snc is false
        "explicit_j2ssh_count": 0,
        // where mid.ssh.use_snc is true
        "explicit_sncssh_count": 0,
        // where mid.ssh.use_snc is some other weird value not true, false, or blank
        "other_value_count": 0
    };

    function updateCountersAndReturnString(value) {
        var lower = value.toLowerCase();
        if (lower == "true")
            ++counterMap["explicit_sncssh_count"];
        else if (lower == "false")
            ++counterMap["explicit_j2ssh_count"];
        else if (isEmptyOrBlank(lower))
            ++counterMap["default_count"];
        else
            ++counterMap["other_value_count"];
        return lower + "";
    }

    // ---------------------------------------------------------------------

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
    Object.keys(counterMap).forEach(function (key) {
        result[key] = counterMap[key];
    })
    result["count"] = arrayOfMappings.length;

    return result;

}
