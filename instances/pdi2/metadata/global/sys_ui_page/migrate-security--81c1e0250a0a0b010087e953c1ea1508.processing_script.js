if (sys_action == 'cancel') {
   var urlOnStack = GlideSession.get().getStack().bottom();
   response.sendRedirect(urlOnStack);
} else
  sys_output = migrateACL();

function migrateACL() {
  var initial_rules = countRules();
  gs.loadBatchScript('upgrade_acls.js');
  var final_rules = countRules();
  return "Completed migration after creating " + (final_rules - initial_rules) + " security rules.";
}

function countRules() {
  var count = new GlideAggregate('sys_security_acl');
  count.addAggregate('COUNT');
  count.query();
  var answer = 0;
  if (count.next()) 
     answer = count.getAggregate('COUNT');
  return answer;
}
