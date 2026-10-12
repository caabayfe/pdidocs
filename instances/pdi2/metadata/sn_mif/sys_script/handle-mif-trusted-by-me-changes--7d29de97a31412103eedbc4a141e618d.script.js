(function executeRule(current, previous /*null when async*/ ) {

    var trustChangeSender = new sn_mif_core.TrustChangeSender();

    var trustDetails = new sn_mif_core.TrustDetails(current.instance.instance_name, current.capability.name, current.capability.application);

    if (current.operation() === "insert") {
        trustChangeSender.handleTrustAddition(trustDetails);
    } else if (current.operation() === "delete") {
        trustChangeSender.handleTrustRemoval(trustDetails);
    } 

})(current, previous);
