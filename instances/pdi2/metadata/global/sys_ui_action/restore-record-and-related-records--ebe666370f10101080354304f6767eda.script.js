var gr = new GlideRecord("sys_archive_log");
gr.addQuery("id", current.sys_id);
gr.addNotNullQuery("archive");
gr.setLimit(1);
gr.query();

if (gr.next())
	new GlideArchiveRestore().restoreMainAndRelated(gr.sys_id);
