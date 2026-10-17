// Set wait_for to be 'workflow' if this approval was created by a workflow activity
if (!current.wf_activity.nil())
   current.wait_for = 'workflow';
