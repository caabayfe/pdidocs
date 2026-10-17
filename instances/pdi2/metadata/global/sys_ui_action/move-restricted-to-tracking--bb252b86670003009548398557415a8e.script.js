var tables = new GlideRecord("sys_db_object");
tables.addQuery("sys_scope", current.sys_id);
tables.addQuery("caller_access", "2");
tables.setValue("caller_access", "1");
tables.updateMultiple();

var scriptIncludes = new GlideRecord("sys_script_include");
scriptIncludes.addQuery("sys_scope", current.sys_id);
scriptIncludes.addQuery("caller_access", "2");
scriptIncludes.setValue("caller_access", "1");
scriptIncludes.updateMultiple();

var events = new GlideRecord("sysevent_register");
events.addQuery("sys_scope", current.sys_id);
events.addQuery("caller_access", "2");
events.setValue("caller_access", "1");
events.updateMultiple();
