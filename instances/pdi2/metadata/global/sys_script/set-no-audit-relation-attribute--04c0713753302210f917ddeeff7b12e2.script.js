(function executeRule(current, previous /*null when async*/ ) {

    if (!current.attributes.includes("no_audit_relation"))
        SNC.DictionaryAttribute.set(current.name, current.element, "no_audit_relation", "true");

})(current, previous);
