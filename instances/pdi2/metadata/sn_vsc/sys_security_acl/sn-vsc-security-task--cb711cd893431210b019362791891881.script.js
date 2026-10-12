(function() {
return gs.hasRole("sn_vsc.task_manager,sn_vsc.security_center_viewer") || gs.getUserID() && gs.getUserID() === current.getValue("assigned_to");
})();
