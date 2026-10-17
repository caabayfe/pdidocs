function getUserDashboards() { 
  var answer = new Array();
  var db = new GlideRecord('sys_dashboard');
  db.addQuery('active', true);
  db.addQuery('name', 'Overview');
  db.query();
  if (db.next())
     answer.push('Overview');

  var db = new GlideRecord('sys_dashboard');
  db.addQuery('active', true);
  db.orderBy('name')
  db.query();
  while (db.next()) {
      if (db.name != 'Overview') {
         if (gs.hasRole(db.roles)) {
            answer.push(db.name.toString());
         }
      }
  }
  return answer.join(',');
}
