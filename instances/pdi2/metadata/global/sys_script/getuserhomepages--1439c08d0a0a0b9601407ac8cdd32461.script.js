function getUserHomepages() { 
  if (!gs.getUser().hasRoles())
    return;

  var answer = new Array();
  var i = 0;
  var hp = new GlideRecord('sys_portal_page');
  hp.addQuery('user',gs.getUserID());
  hp.addQuery('sys_class_name', 'sys_portal_page');
  hp.orderBy('order');
  hp.orderBy('title');
  hp.query();
  while (hp.next()) {
    answer.push(GlideExpressionWrapper().escapeNS(gs.getMessage(hp.title)) + 'xyzzyx' + hp.sys_id);
    i++;
  }
  if (i > 0)
    answer.push('------------xyzzyx');
  hp.initialize();
  hp.addQuery('selectable', true);
  hp.addQuery('sys_class_name', 'sys_portal_page');
  hp.addNullQuery('user');
  hp.orderBy('order');
  hp.orderBy('title');
  hp.query();
  while (hp.next()) {
    if (gs.hasRole(hp.read_roles))
       answer.push(GlideExpressionWrapper().escapeNS(gs.getMessage(hp.title)) + 'xyzzyx' + hp.sys_id);
  }
  return answer.join('^');
}
