(function process(/*ResolverEnvironment*/ env) {

    // implement data resolver here
    // given the label with dependency and the label name
    // extract the parent-child value mappings by querying table sys_choice
    
    var queryArgs = env.getArguments().dependentFieldValueMappingsInput;
    var labelTable = queryArgs.label_table;
    var dependentLabel = queryArgs.dependent_label; // label which is dependent on other field(e.g. subcategory)
    var domainSysId = queryArgs.domain_sys_id;
    var paginationData = queryArgs.pagination_data;
    var limit = paginationData.hasOwnProperty("limit") ? paginationData.limit : 5000;
    var offset = paginationData.hasOwnProperty("offset") ? paginationData.offset : 0;

    var dataRecord = new GlideRecord("sys_choice");
    var encodedQuery = "name=" + labelTable + "^element=" + dependentLabel + "^inactive=False";
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
    dataRecord.chooseWindow(offset, offset + limit);
    dataRecord.query();

    // extract value mappings between the two fields with dependency
    var records = [];
    while (dataRecord.next()) {
        records.push({
            "value": dataRecord.getValue("dependent_value"), // value of parent label(e.g. category)
            "dependent_value": dataRecord.getValue("value") // value of child label(e.g. subcategory)
        });
    }

    // update offset to be used in next pagination, -1 means to stop the pagination
    if (records.length < limit) {
        offset = -1;
    } else {
        offset += records.length;
    }
    paginationData["offset"] = offset;

    var dependentFieldValueMappings = {
        "records": records,
        "pagination_data": paginationData
    };
    return dependentFieldValueMappings;

})(env);
