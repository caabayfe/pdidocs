(function process(/*ResolverEnvironment*/ env) {

    // implement data resolver here
    // given list of labels and the label name
    // check if the fields have dependent relationship by querying table sys_dictionary

    var dependentFields = [];

    var queryArgs = env.getArguments().dependentFieldsInput;
    var labelTable = queryArgs.label_table;
    var labels = queryArgs.labels;
    var domainSysId = queryArgs.domain_sys_id;

    var dataRecord = new GlideRecord("sys_dictionary");
    var encodedQuery = "name=" + labelTable + "^elementIN" + labels.join(",");
    dataRecord.addEncodedQuery(encodedQuery);
    // add domain query if domain separation enabled on instance
    if (domainSysId && GlideDomainSupport.isDataOrProcessSeparationEnabled()) {
        var domainTableName = GlideDomainSupport.getDomainTable();
        var domainGr = new GlideRecord(domainTableName);
        if (domainGr.isValid()) {
            domainGr.addQuery("sys_domain", domainSysId);
            domainGr.query();
            if (domainGr.next() && domainGr.isValidRecord()) {
                dataRecord.addDomainQuery(domainGr);
            }
        }
    }
    dataRecord.query();

    while (dataRecord.next()) {
        if ((dataRecord.getValue("use_dependent_field")) && (labels.indexOf(dataRecord.getValue("dependent_on_field")) != -1)) {
            dependentFields.push({
                "label": dataRecord.getValue("dependent_on_field"),
                "dependent_label": dataRecord.getValue("element")
            });
        }
    }

    return dependentFields;

})(env);
