// if parent not persisted, then records from current should not be retrieved
var table = new GlideRecord(parent.getTableName());
table.addQuery('sys_id', parent.sys_id);
table.query();
var tableAncestors = table.hasNext() ? SNC.TableEditor.getTableAncestors(parent.name) : [];
current.addQuery('name', 'ONE IN', tableAncestors);
current.addQuery('element', '!=', 'NULL');
