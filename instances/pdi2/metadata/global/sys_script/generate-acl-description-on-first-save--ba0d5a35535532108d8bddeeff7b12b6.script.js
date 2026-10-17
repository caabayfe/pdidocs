(function executeRule(current, previous /*null when async*/ ) {
    // Only process record type ACLs
    if (current.type != 'record' || !current.active)
        return;

    // Check if this is a new ACL with empty description
    if (gs.nil(current.description)) {
        // Wait a moment to allow roles to be created
        gs.sleep(500);

        // Create an instance of the ACLDescriber
        var ad = new ACLDescriber();

        // Force an update of the description
        ad.ensureDescription(current, true);

        // Update the record without triggering workflows
        current.setWorkflow(false);
        current.update();

        gs.log("Generated description for new ACL: " + current.name, "ACLDescriber");
    }
})(current, previous);
