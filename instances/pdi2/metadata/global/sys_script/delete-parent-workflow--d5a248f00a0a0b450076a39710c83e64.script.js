//If a workflow version is deleted, and its the last remaining version, delete the parent workflow

deleteParentWorkflow();

function deleteParentWorkflow() {
   var wfVersion = new GlideRecord('wf_workflow_version');
   wfVersion.addQuery('workflow', current.workflow);
   wfVersion.query();
   if (!wfVersion.next()) {

      //Youre the last version...delete the parent
      var wf = new GlideRecord('wf_workflow');
      wf.get(current.workflow);
      if (wf.get(current.workflow))
          wf.deleteRecord(); 
   }
}
