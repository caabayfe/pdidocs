current.addQuery('source_table', parent.getTableName());
current.addQuery('document_id', parent.sys_id);
current.addQuery('state','!=','not_required');
