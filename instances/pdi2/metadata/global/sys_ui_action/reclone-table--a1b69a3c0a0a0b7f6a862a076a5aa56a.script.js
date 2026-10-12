GlideRunScriptJob.scheduleScript("new TableCopy('" + current.sys_id + "').process();");

gs.addInfoMessage("Started table copy for: " + current.table_name);
