var gr = new GlideRecord('sys_attachment_migration_tracker');
gr.addQuery('active', true);
gr.query();
gr.hasNext();
