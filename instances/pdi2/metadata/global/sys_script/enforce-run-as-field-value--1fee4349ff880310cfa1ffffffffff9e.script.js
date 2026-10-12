(function executeRule(current, previous /*null when async*/ ) {

    var PRIVILEGED_ROLES = ['admin'];

    function hasPrivilegedRole() {
        for (var i = 0; i < PRIVILEGED_ROLES.length; i++) {
            if (gs.hasRole(PRIVILEGED_ROLES[i])) {
                return true;
            }
        }
        return false;
    }

    if (!hasPrivilegedRole()) {

        if (current.getValue("run_as") && current.getValue("run_as") !== gs.getUserID()) {
            gs.warn(gs.getMessage('[PAR Export Job Security]: run_as override attempt detected. Submitted value {0} replaced with current user {1}',
                [
                    current.getValue("run_as"),
                    gs.getUserID()
                ]
            ));
        }

        // Unconditionally stamp run_as to the current user
        // regardless of what was submitted via UI, REST, or script
        current.setValue("run_as", gs.getUserID());
    }

})(current, previous);
