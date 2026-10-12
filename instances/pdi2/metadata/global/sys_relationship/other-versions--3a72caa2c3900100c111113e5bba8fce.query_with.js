current.addQuery('original_id', parent.original_id);
current.addQuery('sys_id', '!=', parent.sys_id);
current.orderByDesc('record_version');
