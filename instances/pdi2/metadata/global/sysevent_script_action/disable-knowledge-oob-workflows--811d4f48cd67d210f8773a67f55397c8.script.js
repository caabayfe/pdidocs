  const kmFlowAPI = new global.KBFlow();
      const scriptActionSysIdForCurrentRecord = '811d4f48cd67d210f8773a67f55397c8';
      const approvalOwnershipWorkflow = '6b84f4ffb712230026778d78ee11a97e';
      if (checkIfWorkflowIsOOB(approvalOwnershipWorkflow)) {
          kmFlowAPI.linkFlowToCatalog();
          kmFlowAPI.disableOOBWorkflow(approvalOwnershipWorkflow);
      }

      function checkIfWorkflowIsOOB(workflowVersion) {
        const workflowVersionGR = new GlideRecordSecure('wf_workflow_version');
        workflowVersionGR.addEncodedQuery('active=true^published=true');
        workflowVersionGR.addQuery('sys_id', workflowVersion); //sys_id from wf_workflow_version for approval ownership group
        workflowVersionGR.query();
        if (workflowVersionGR.getRowCount() == 1) {
          return true;
        }
        return false;
      }
      //De activate the script once it is completed the execution
      const eventScriptActionGr = new GlideRecord('sysevent_script_action');
      if (eventScriptActionGr.get(scriptActionSysIdForCurrentRecord)) {
        eventScriptActionGr.setValue('active', false);
        eventScriptActionGr.update();
        gs.info('Disabling the script action {0} ({1}) as it should only run once.', [scriptActionSysIdForCurrentRecord, "Disable Knowledge OOB Workflows"]);
  }
