function transform(input) {
    var compositeDataId = input.compositeDataId;
	
	// Again Ignoring properties are resulting error
    var config = {
        recordTypeToEvamTemplate: {},
		recordTypeToFieldsMap: "null"
    };

    // compositeDataId optional parameter resolving to '@context.props.compositeDataId' if no value being passed.
    if (compositeDataId && compositeDataId.charAt('0') == '@')
        compositeDataId = null;
	
    if (!compositeDataId)
        return config;
	
	var recordTypeToEvamTemplate = {};
	var recordTypeToFieldsMap = [];

    var m2mPredicateGR = new GlideRecord("sys_ux_composite_data_m2m_predicate_bundle");
    m2mPredicateGR.addQuery("dataset", compositeDataId);
    m2mPredicateGR.query();

    while (m2mPredicateGR.next()) {

        var predicateBundleId = m2mPredicateGR.getValue("predicate_bundle");

        if (predicateBundleId) {
            var predicateGR = new GlideRecord("sys_ux_composite_data_template_predicate");
            predicateGR.addQuery("predicate_bundle", predicateBundleId);
            predicateGR.addActiveQuery();
            predicateGR.query();
            while (predicateGR.next()) {
                var table = predicateGR.getValue("table");
                if (table) {
                    var fieldList = predicateGR.getValue("field_list");
                    var fields = fieldList ? fieldList.split(",") : [];

                    recordTypeToFieldsMap.push({
                        recordType: table,
                        fields: fields,
                    });

                    var uxTemplateId = predicateGR.getValue("ux_template");
                    if (uxTemplateId) {
                        var templateGR = new GlideRecord("sys_ux_composite_data_template");
                        if (templateGR.get(uxTemplateId)) {
                            var templateContent = templateGR.getValue("template");
                            if (templateContent) {
                                try {
                                    var record = recordTypeToEvamTemplate[table] = JSON.parse(templateContent);
                                    record.fields = fields;
                                } catch (e) {
                                    // bad control character in string literal
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    if (recordTypeToFieldsMap.length > 0) {
		//config.recordTypeToFieldsMap = recordTypeToFieldsMap;
        config.recordTypeToFieldsMap = JSON.stringify(recordTypeToFieldsMap);
        config.recordTypeToEvamTemplate = recordTypeToEvamTemplate;
    }

    return config;
}
