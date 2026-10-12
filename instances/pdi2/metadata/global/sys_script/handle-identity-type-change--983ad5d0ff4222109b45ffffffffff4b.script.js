(function executeRule(current, previous /*null when async*/ ) {
    var AI_AGENT = "ai_agent";
    var HUMAN = "human";
    var MACHINE = "machine";
    var UNCLASSIFIED = "unclassified";
    var validIdentityTypes = [AI_AGENT, HUMAN, MACHINE, UNCLASSIFIED];

    if (current.isNewRecord()) {
        setWSAByIdentityType();
        return;
    }

    // If Identity type is changed, it takes precedence.
    if (current.identity_type.changes()) {
        if (shouldRestrictIdentityTypeChange(current.identity_type, previous.identity_type)) {
            gs.addErrorMessage(gs.getMessage("Cannot change Identity type from {0} to {1}",
                [previous.identity_type.getDisplayValue(), current.identity_type.getDisplayValue()]));
            current.setAbortAction(true);
            return;
        }
        setWSAByIdentityType();
    }

    // If only wsa is changed.
    if (!current.identity_type.changes() && current.web_service_access_only.changes()) {
        if (current.identity_type == AI_AGENT) {
            current.web_service_access_only = false;
        } else {
            setIdentityTypeByWSA();
        }
    }

    function shouldRestrictIdentityTypeChange(identityType, previousIdentityType) {
        // switching from/to AI_AGENT type is not allowed.
        if (previousIdentityType == AI_AGENT || identityType == AI_AGENT) {
            return true;
        }

        //Human, Machine users cannot be changed to Unclassified or empty.
        if ([HUMAN, MACHINE].includes(previousIdentityType) && (identityType == UNCLASSIFIED ||
                !validIdentityTypes.includes(identityType))) {
            return true;
        }

        return false;
    }

    function setWSAByIdentityType() {
        switch (current.identity_type.toString()) {
            case MACHINE:
                current.web_service_access_only = true;
                break;

            case AI_AGENT:
            case HUMAN:
                current.web_service_access_only = false;
                break;

            case UNCLASSIFIED:
            default:
                //Unclassified and invalid identity types
                setIdentityTypeByWSA();
        }
    }

    function setIdentityTypeByWSA() {
        if (current.web_service_access_only == true) {
            current.identity_type = MACHINE;
            gs.info("Setting Identity type to Machine as web_service_access_only is true for user: " +
                current.getDisplayValue());
        } else {
            current.identity_type = UNCLASSIFIED;
        }
    }

})(current, previous);
