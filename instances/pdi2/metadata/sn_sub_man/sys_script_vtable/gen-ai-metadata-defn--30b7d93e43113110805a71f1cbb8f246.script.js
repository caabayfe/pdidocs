(function executeQuery(v_table, v_query) {
    var encodedQuery = v_query.getCondition("subscription.sys_id");
    var GR = new GlideRecord('sku_metadata');
    if(encodedQuery) {
      GR.addEncodedQuery(encodedQuery);
    }
    GR.addQuery('schema', 'genai_metadata');
    GR.query();
    while (GR.next()) {
        var subscriptionId = String(GR.subscription.sys_id);
        var columnValues = GR.getValue('column_values');
        var columnValuesArray = columnValues.split(',');
        var featureId = columnValuesArray[0];
        var feature = columnValuesArray[1];
        var assistRatio = columnValuesArray[2];
        // insert into gen_ai_metadata table
        v_table.addRow({
            subscription: subscriptionId,
            feature_id: featureId,
            feature: feature,
            assist_ratio: assistRatio,
            sys_id: gs.generateGUID()
        });
    }
})(v_table, v_query);
