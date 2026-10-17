(function executeRule(current, previous /*null when async*/ ) {

    /*
     * This BR applies only to Horizontal Discovery probe.
     * Since the specific pattern launched in an HD probe isn’t known in advance,
     * we can’t define a probe parameter (discovery_probe_parameter) the way we do for other probes.
     * Instead, this Business Rule dynamically inserts the appropriate redaction regex
     * based on the pattern that runs.
     * For better performance, we read from `discovery_private_properties`
     * rather than directly querying the discovery_sensitive_data_filter table.
     */

    var payload = current.payload;
    if (JSUtil.nil(payload) || !getAgent())
        return;

    var patternSysId = extractParameterValue(payload, "patternId");
    var redactionRegexes = getSensitiveDataRegexes(patternSysId);

    if (redactionRegexes && Object.keys(redactionRegexes).length > 0)
        addParameter("redaction_regex", JSON.stringify(redactionRegexes));
    else
        gs.debug("InsertRedactionFilter: No filters found. Not running the redaction logic");

    current.payload = payload;

    function getAgent() {
        var agentName = current.agent + "";
        var midName = agentName.substr("mid.server.".length, agentName.length);
        var agentCache = new SNC.ECCAgentCache();
        return agentCache.getByName(midName);
    }

    function addParameter(name, value) {

        value = value.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        // Check for existing parameter and update if it exists, otherwise insert new parameter
        var pattern = '<parameter name\\s*=\\s*"' + name + '" value\\s*=\\s*"([^"]*)"\\s*/>';
        var regex = new RegExp(pattern);
        var match = regex.exec(payload);

        if (match) {
            payload = payload.replace(match[0], '<parameter name="' + name + '" value="' + value + '"/>');
        } else {
            var insertPos = payload.indexOf('</parameters>');
            if (insertPos !== -1) {
                payload = payload.slice(0, insertPos) +
                    '<parameter name="' + name + '" value="' + value + '"/>' +
                    payload.slice(insertPos);
            }
        }
    }

    function getSensitiveDataRegexes(patternSysId) {
        var propGR = new GlideRecord('discovery_private_properties');
        propGR.addQuery('name', 'pattern_sensitive_filter_cache');
        propGR.query();
        var result = {}; // Default to an empty object
        if (propGR.next()) {
            var cache = JSON.parse(propGR.value + '');
            // Return the object of rules for the pattern, or an empty object.
            result = cache[patternSysId] || {};
        }
        return result;
    }


    function extractParameterValue(payload, fieldName) {
        if (!payload || !fieldName)
            return null;
        var regex = new RegExp('<parameter\\s+name="' + fieldName + '"\\s+value="([^"]+)"\\s*/>');
        var match = regex.exec(payload);
        return match ? match[1] : null;
    }

})(current, previous);
