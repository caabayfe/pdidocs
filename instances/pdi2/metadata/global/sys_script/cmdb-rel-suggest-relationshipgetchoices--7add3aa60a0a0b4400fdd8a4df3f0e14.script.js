function cmdb_rel_type_suggest_relationshipGetChoices() {
  var gr = new GlideRecord('cmdb_rel_type');
  gr.orderBy('parent_descriptor');
  gr.query();
  while(gr.next()) {
    var pid = 'parent:' + gr.sys_id;
    var cid = 'child:' + gr.sys_id;
    pid = pid.trim();
    cid = cid.trim();
    answer.add(pid, gs.getMessage('{0} (parent)', gr.parent_descriptor.getDisplayValue()));
 
    answer.add(cid, gs.getMessage('{0} (child)', gr.child_descriptor.getDisplayValue()));
  }
  answer.removeNone();

}
