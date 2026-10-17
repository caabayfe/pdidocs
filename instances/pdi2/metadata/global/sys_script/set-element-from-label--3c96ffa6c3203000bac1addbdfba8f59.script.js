var scope = (typeof parent != 'undefined' && parent != null) ? parent.sys_scope.toString() : current.sys_scope.toString();
current.element = SNC.TableEditor.getValidScopedElementName(scope, current.column_label.toString(), current.name);
