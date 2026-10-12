var wizard = current.getValue('wizard');
if (GlideStringUtil.isEligibleSysID(wizard))
	answer = true;
else {
    var sys_id = current.getValue('sys_id');
    if (GlideStringUtil.isEligibleSysID(sys_id)) {
        var q = GlideappQuestion.getQuestion(sys_id);
        if (q != null)
            answer = gs.hasRole(q.getReadRoles());
        else {
            var gr = new GlideRecord('item_option_new_set');
            if (gr.get(sys_id)) 
                answer = gs.hasRole(gr.getValue('read_roles'));
        }
    }
}
