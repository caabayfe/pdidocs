var AISIndexSourceUtils = Class.create();
AISIndexSourceUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {


    decodeConditions: function() {
        var encodedQuery = this.getParameter('condition');
        var table = this.getParameter('table');

        var conditions = [];

        // Parse Each Condition
        var encodedQueryConditions = encodedQuery.toString().split("\\^");
        for (var conditionNumber = 0; conditionNumber < encodedQueryConditions.length; conditionNumber++) {
            var encodedCondition = encodedQueryConditions[conditionNumber];
            var qs = new GlideQueryString(table, encodedCondition);
            qs.deserialize();
            var terms = qs.getTerms();
            for (var i = 0; i < terms.size(); i++) {
                var condition = terms.get(i);
                conditions.push({
                    "field": condition.getField(),
                    "operator": condition.getOperator(),
                    "value": condition.getValue()
                });
            }
        }
        return JSON.stringify(conditions);
    },

    checkGuardRailLimit: function() {

        var tableName = this.getParameter('table');
        if (sn_ais.AisUtil.isGuardRailLimitApplicable(tableName))
            return true;

        return false;
    },

    type: 'AISIndexSourceUtils'
});
