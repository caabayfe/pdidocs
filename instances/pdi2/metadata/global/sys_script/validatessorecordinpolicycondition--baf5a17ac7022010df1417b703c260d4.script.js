(function executeRule(current, previous /*null when async*/ ) {

	//only run the validation logic regarding whether the IDP is being used in policy conditions or not, if the operation is delete or if user is trying to update the IDP status from active to inactive 
    if (current.operation() == 'delete' || (current.operation() == 'update' && current.getValue('active') == 0 && previous.getValue('active') == 1)) {

        var ga = new GlideAggregate("sys_auth_policy_condition");
        if (ga.isValid()) {
            ga.addAggregate("COUNT");
            ga.addQuery('condition', 'CONTAINS', current.getUniqueValue());
            ga.query();

            var res = 0;
            if (ga.next())
                res = ga.getAggregate("COUNT");

            if (res > 0) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("Failed to Delete/Decativate Identity Provider '{0}' as it is referenced in one or more Policy Conditions.", current.getValue('name')));
            }
        }
    }

})(current, previous);
