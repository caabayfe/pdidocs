(function() {
    return gs.hasRole("sn_vsc.task_manager") || gs.getUserID() && gs.getUserID() === current.getValue("assigned_to");
})();
