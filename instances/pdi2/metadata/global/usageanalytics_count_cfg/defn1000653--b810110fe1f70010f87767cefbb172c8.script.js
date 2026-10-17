var activeUsers = new GlideAggregate('sys_user');
activeUsers.addQuery('active', 'true');
activeUsers.query();

var usersWithExternalRole = new GlideAggregate('sys_user_has_role');
usersWithExternalRole.addQuery('role.name', '=','snc_external');
usersWithExternalRole.groupBy('user');
usersWithExternalRole.query();

answer = activeUsers.getRowCount()-usersWithExternalRole.getRowCount();
