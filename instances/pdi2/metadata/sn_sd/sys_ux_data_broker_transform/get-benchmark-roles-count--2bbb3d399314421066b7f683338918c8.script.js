function transform(input) {
    var roles = new sn_sd.SDRolesUtility().getBMRolesList();
    var gr = new GlideAggregate('sys_user_has_role');
    gr.addEncodedQuery("role.sys_idIN" + roles.join(","), true);
    gr.addAggregate('COUNT(DISTINCT', 'user');
	gr.setGroup(false);
    gr.query();
    var count = 0;
    if (gr.next())
        count = gr.getAggregate('COUNT(DISTINCT','user');
    return count;
}
