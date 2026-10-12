function getScope(scopeRecord) {
  return ((scopeRecord.scope == 'global') ? '' : scopeRecord.scope);
}

function getPrefix(scope) {
  return ((scope) ? scope + '_' : '');
}

var potential_scope_prefix = getPrefix(getScope(current.sys_scope));
answer = potential_scope_prefix + current.name;
