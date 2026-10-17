function transform(input) {
    var result = {};
    var templateIds = input.templateSysIds;
    if (templateIds.length == 0) {
        return result;
    }
    for (var i = 0; i < templateIds.length; i++) {
        var templateId = templateIds[i];
        result = sn_cmdb.DuplicateTemplate.runTemplate(templateId);
    }
    return result;
}
