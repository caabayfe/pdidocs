var scope = (current.sys_scope.scope+'').toLowerCase();
if (scope && scope != 'global')
    current.display_name = current.sys_scope.scope + '_' + current.name + '.do';
