cascadeDomainFromVersion();

function cascadeDomainFromVersion() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   domainCascadeActivity();
   domainCascadeTransition();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}

function domainCascadeActivity() {
   var ac = new GlideRecord('wf_activity');
   ac.addQuery('workflow_version', current.sys_id);
   ac.query();
   while (ac.next()) {
      ac.sys_domain = current.sys_domain;
      ac.update();
   }
}

function domainCascadeTransition() {
   var tr = new GlideRecord('wf_transition');
   tr.addQuery('to.workflow_version', current.sys_id).addOrCondition('from.workflow_version', current.sys_id);
   tr.query();
   while (tr.next()) {
      tr.sys_domain = current.sys_domain;
      tr.update();
   }
}
