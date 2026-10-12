answer = false;
if (!gs.nil(current.project)) {
    answer = new global.ProminACLUtilSNC(current.project.getRefRecord()).canWriteInChildTableDef();
} else if (!gs.nil(current.process_def)) {
    answer = gs.hasRole("sn_process_mining_power_user");
}
