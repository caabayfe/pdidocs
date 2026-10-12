(function executeRule(current, previous /*null when async*/ ) {
    // stop if the name is invalid or this ACL is table level
    var name = current.name;
    if (!name || !name.includes('.'))
        return;

    var describer = new ACLDescriber();
    var fieldPortion = name.split('.')[1];

    // stop if this isn't a datatype ACL
    if (!(describer.isDataTypeAcl(fieldPortion)))
        return;

    // validate the provided data type
    var dataType = describer.extractLettersBetweenBrackets(fieldPortion);

    if (!isDataTypeValid(dataType)) {
        gs.addErrorMessage(gs.getMessage('The data type provided is invalid'));
        current.setAbortAction(true);
    }

    function isDataTypeValid(type) {
        var glideObjGr = new GlideRecord("sys_glide_object");
        glideObjGr.addQuery('name', type);
        glideObjGr.query();

        return glideObjGr.next();
    }
})(current, previous);
