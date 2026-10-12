var binding = new GlideRecord('state_binding');
binding.addQuery('document_key', current.sysapproval);
binding.addQuery('pending_list', '!=', '');
binding.query();
if(binding.next()) {
  current.state_binding = binding.sys_id;
  current.process_guide = binding.process_guide;
  current.process_step = binding.pending_list;
  current.iteration = calculateIteration(binding.sys_id, current.process_step);
  current.state = 'requested';
}

function calculateIteration(bindingId, step){
  var approval = new GlideRecord('sysapproval_approver');
  approval.addQuery('state_binding', bindingId);
  approval.addQuery('process_step', step);
  approval.addQuery('state', 'requested');
  approval.query();
  if(approval.next())
     return approval.iteration;
}
