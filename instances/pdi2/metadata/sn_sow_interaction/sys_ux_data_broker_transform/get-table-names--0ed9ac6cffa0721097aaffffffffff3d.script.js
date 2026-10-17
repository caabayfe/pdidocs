function transform(input) {
    const {
        searchValue
    } = input;

    var res = [];
    var tableNames = [];
    var session = gs.getSession();
    var language = session.getLanguage();
    var commonQuery = "nameLIKE" + GlideStringUtil.escapeQueryTermSeparator(searchValue) + "^ORlabelLIKE" + GlideStringUtil.escapeQueryTermSeparator(searchValue);

    if (searchValue && language !== "en") {
        var encodedQuery = "elementISEMPTY^language=" + GlideStringUtil.escapeQueryTermSeparator(language) + "^" + commonQuery;
        const docGr = new GlideRecordSecure("sys_documentation");
        docGr.addEncodedQuery(encodedQuery, true);
        docGr.query();
        while (docGr.next()) {
            if (docGr.getValue("name"))
                tableNames.push(docGr.getValue("name"));
        }
    }

    const dbObjGr = new GlideRecordSecure("sys_db_object");
    if (tableNames.length !== 0)
        dbObjGr.addQuery("name", 'IN', tableNames.join(','));
    if (searchValue && language === "en")
        dbObjGr.addEncodedQuery(commonQuery, true);
    dbObjGr.orderBy('label');
    dbObjGr.setLimit(25);
    dbObjGr.query();
    while (dbObjGr.next()) {
        res.push({
            name: dbObjGr.getValue("name"),
            label: dbObjGr.getDisplayValue("label")
        });
    }

    var count = new GlideAggregate("sys_db_object");
    if (tableNames.length !== 0)
        count.addQuery("name", 'IN', tableNames.join(','));
    if (searchValue && language === "en")
        count.addEncodedQuery(commonQuery, true);
    count.addAggregate('COUNT');
    count.query();
    var totalCount = 0;
    if (count.next())
        totalCount = count.getAggregate('COUNT');

    return {
        "totalCount": totalCount,
        "tables": res
    };
}
