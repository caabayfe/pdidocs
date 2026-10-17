function transform(input) {
    var DM = new CMDBWsDMConstants();

    function _areFieldsEqual(currentFields, duplicateFields) {
        currentFieldsArray = currentFields.split(',').filter(function(element) {
            return element.trim() !== '';
        });
        duplicateFieldsArray = duplicateFields.split(',').filter(function(element) {
            return element.trim() !== '';
        });

        currentFieldsArray.sort();
        duplicateFieldsArray.sort();

        if (currentFieldsArray.length !== duplicateFieldsArray.length) {
            return false;
        }

        for (var i = 0; i < currentFieldsArray.length; i++) {
            if (currentFieldsArray[i] !== duplicateFieldsArray[i]) {
                return false;
            }
        }

        return true;
    }

    var wrapperFunction = function() {
        var result = {};
        var policySysId = input.policyId;
        var currentPolicyGr = new GlideRecord(DM.CERTIFICATION_POLICY.TABLE);
        currentPolicyGr.get(policySysId);

        var currentCertFields = currentPolicyGr.getValue(DM.CERTIFICATION_POLICY.CERTIFICATION_FIELDS);
        var currentPolicyTable = currentPolicyGr.getValue(DM.CERTIFICATION_POLICY.TABLE_COL);
        var currentEncodedQuery = currentPolicyGr.getValue(DM.POLICY.ENCODED_QUERY);

        var duplicatePolicyGr = new GlideRecord(DM.CERTIFICATION_POLICY.TABLE);
        duplicatePolicyGr.addQuery(DM.SYS_ID, "!=", policySysId);
        duplicatePolicyGr.addQuery(DM.CERTIFICATION_POLICY.TABLE_COL, currentPolicyTable);
        if (global.JSUtil.notNil(currentEncodedQuery)) {
            duplicatePolicyGr.addQuery(DM.POLICY.ENCODED_QUERY, currentEncodedQuery);
        }
        duplicatePolicyGr.query();

        if (duplicatePolicyGr.getRowCount() == 0) {
            result.hasDuplicates = false;
            result.duplicatePolicySysId = [];
            return result;
        }

        var duplicatePolicyCount = 0;
        var duplicatePolicySysId = [];
        while (duplicatePolicyGr.next()) {
            var certFields = duplicatePolicyGr.getValue(DM.CERTIFICATION_POLICY.CERTIFICATION_FIELDS) || '';
            if (_areFieldsEqual(currentCertFields, certFields)) {
                duplicatePolicyCount += 1;
                duplicatePolicySysId.push(duplicatePolicyGr.getUniqueValue());
            }
        }

        result.hasDuplicates = duplicatePolicyCount > 0 ? true : false;
        result.duplicatePolicySysId = duplicatePolicySysId;

        return result;

    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get data certification duplicate policy", wrapperFunction);
}
