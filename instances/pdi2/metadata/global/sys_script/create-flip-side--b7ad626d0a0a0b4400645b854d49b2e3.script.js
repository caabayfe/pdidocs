peerIfNecessary();

function peerIfNecessary() {
  var newRel = '';
  if (current.relationship.indexOf('parent') == 0)
    newRel = ('child:' + current.cmdb_rel_type).trim();
  else
    newRel = ('parent:' + current.cmdb_rel_type).trim();

  gs.print('OLD = ' + current.relationship + ' NEW = ' + newRel);

  var gr = new GlideRecord('cmdb_rel_type_suggest');
  gr.addQuery('cmdb_rel_type', current.cmdb_rel_type);
  gr.addQuery('relationship', newRel);
  gr.addQuery('base_class', current.dependent_class);
  gr.addQuery('dependent_class', current.base_class);
  gr.query();
  if (gr.next()) 
    return; // already have one
  

  gr = new GlideRecord('cmdb_rel_type_suggest');
  gr.sys_scope = current.sys_scope;
  gr.base_class = current.dependent_class;
  gr.dependent_class = current.base_class;
  gr.relationship = newRel;
  gr.cmdb_rel_type = current.cmdb_rel_type;
  gr.skip_validation = true;
  gr.insert();
}
