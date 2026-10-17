(function executeRule(current, previous /*null when async*/) {
  if(!gs.nil(current.sys_rte_eb_entity))
     current.sys_rte_eb_definition = current.sys_rte_eb_entity.sys_rte_eb_definition;
})(current, previous);
