updateIncidentCount();

function updateIncidentCount() {
    var prev = "";
    if (typeof previous != "undefined" && previous != null)
        prev = previous.parent_incident + "";
    var sowMraUtils = new SOWMraUtils();
    if (current.operation() == 'delete' && !current.parent_incident.nil())
        sowMraUtils.updateChildIncidentCount(current.parent_incident + "");

    if (prev != "")
        sowMraUtils.updateChildIncidentCount(prev);
}
