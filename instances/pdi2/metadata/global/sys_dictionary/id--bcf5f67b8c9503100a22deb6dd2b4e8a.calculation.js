if (current.name) {current.id = (current.sys_scope.scope != 'global') ? current.sys_scope.scope + '.' + current.name.replace(/[^A-Za-z0-9_]/g, '_') : current.name.replace(/[^A-Za-z0-9_]/g, '_');}
