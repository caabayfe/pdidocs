/*
 * Keep domains in synch with related tasks for:
 *   - wf_context
 *   - wf_executing
 *   - wf_history
 *   - task_sla and its workflow
 *   - sysapproval_approver and its workflow
 *   - sysapproval_group and its workflow
 *   - emails
 */

cascadeDomainFromTask();

function cascadeDomainFromTask() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);

   cascadeDomainToWF(current); // synch workflows for current task
   cascadeTaskDomain('live_group_profile', 'document'); // synch Live Feed Group
   cascadeTaskDomain('task_sla', 'task'); // synch task SLAs
   cascadeTaskDomain('sysapproval_approver', 'sysapproval'); // synch approvals using sysapproval column
   cascadeTaskDomain('sysapproval_approver', 'document_id'); // synch approvals using document_id
   cascadeTaskDomain('sysapproval_group', 'parent'); // synch group approvals
   cascadeDomainToEmails();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}

function cascadeTaskDomain(table, field, field2) {
   var gr = new GlideRecord(table);
   var hasDomain = gr.isValidField('sys_domain');
   var qc1 = gr.addQuery(field, current.sys_id);
   if (field2)
      qc1.addOrCondition(field2, current.sys_id);
   gr.query();
   while (gr.next()) {
      if (hasDomain) {
         gr.sys_domain = current.sys_domain;
         gr.update();
      }
      cascadeDomainToWF(gr); // synch associated workflows
   }
}

function cascadeDomainToWF(parent) {
   // WF_CONTEXT - CASCADE
   var wfc = new GlideRecord('wf_context');
   wfc.addQuery('id', parent.sys_id);
   wfc.query();
   while (wfc.next()) {
      wfc.sys_domain = current.sys_domain;
      wfc.update();

      // WF_EXECUTING - CASCADE
      var wfe =  new GlideMultipleUpdate('wf_executing');
      wfe.addQuery('context', wfc.sys_id);
      wfe.setValue('sys_domain', current.sys_domain);
      wfe.execute();

      // WF_HISTORY - CASCADE
      var wfh =  new GlideMultipleUpdate('wf_history');
      wfh.addQuery('context', wfc.sys_id);
      wfh.setValue('sys_domain', current.sys_domain);
      wfh.execute();
   }
}

function cascadeDomainToEmails() {
   var em = new GlideRecord("sys_email");
   em.addQuery("instance", current.sys_id);
   em.query();
   while (em.next()) {
      em.setWorkflow(false);
      em.sys_domain = current.sys_domain;
      em.update();

      // email might have attachments, and workflow is off, so update here
      var att =  new GlideMultipleUpdate('sys_attachment');
      att.addQuery('table_sys_id', em.sys_id);
      att.setValue('sys_domain', current.sys_domain);
      att.execute();
   }
}
