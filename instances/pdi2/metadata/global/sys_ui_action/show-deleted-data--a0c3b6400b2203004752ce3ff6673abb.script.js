var table = "sh$" + current.getValue('storage_table_name');
var context = current.getValue('context');
var id = current.getValue('document_id');
action.setRedirectURL(table + "_list.do?sysparm_query=sh$context=" + context + "^sys_id=" + id);
