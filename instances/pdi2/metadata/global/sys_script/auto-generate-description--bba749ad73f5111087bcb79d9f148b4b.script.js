(function executeRule(current, previous /*null when async*/ ) {
    var description;
    if (current.defined_as == "ci") {
        description = "CI <" + current.cmdb_ci.getDisplayValue() + ">";
    } else { // CI class
        description = "CI class <" + current.cmdb_ci_class + ">";
    }
    description += " in service <" + current.service.getDisplayValue() + ">";
    description += "       (*** auto generated ***)";

    current.setValue("description", description);

})(current, previous);
