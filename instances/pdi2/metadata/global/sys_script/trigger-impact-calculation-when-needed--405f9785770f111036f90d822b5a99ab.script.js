//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Trigger impact calculation when needed. After Business Rule.
// @Author: Vadim Dukhovny
// Uncomment comments lines to see logs - for easy troubleshooting
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function executeRule(current, previous /*null when async*/ ) {
    var im = new SNC.ImpactManager();
    //gs.log(current.operation() + " operation on a Manual Cluster");
    //gs.log("Current MC: " + JSON.stringify(current));
    //gs.log("Previous MC: " + JSON.stringify(previous));

    // delete operation (current is the object before the deletion, previous = null)
    if (current.operation() == "delete" && current.active) {
        //gs.log("Triggering impact calculation upon deletion of an active manual cluster on service " + current.service.getDisplayValue());
        im.triggerImpactByRule(current.service);
        return;
    }

    // insert operation (current = previous)
    if (current.operation() == "insert") {
        if (current.active) {
            //gs.log("Triggering impact calculation upon creation of an active manual cluster on service " + current.service.getDisplayValue());
            im.triggerImpactByRule(current.service);
        }
        return;
    }

    // update operation (current != previous)
    // check if service has changed - then need to trigger impact on both old and new services (depends on Active field)
    if (current.service != previous.service) {
        if (previous.active) {
            //gs.log("Triggering impact calculation upon update of a manual cluster on a previous service " + previous.service.getDisplayValue());
            im.triggerImpactByRule(previous.service);
        }
        if (current.active) {
            //gs.log("Triggering impact calculation upon update of a manual cluster on a new service " + current.service.getDisplayValue());
            im.triggerImpactByRule(current.service);
        }
        return;
    }

    if (current.active != previous.active ||
        current.cmdb_ci != previous.cmdb_ci ||
        current.cmdb_ci_class != previous.cmdb_ci_class
    ) {
        //gs.log("Triggering impact calculation upon update of a manual cluster on service " + current.service.getDisplayValue());
        im.triggerImpactByRule(current.service);
    }
})(current, previous);
