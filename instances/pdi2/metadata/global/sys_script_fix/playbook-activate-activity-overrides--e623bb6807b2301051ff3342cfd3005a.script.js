var gr = new GlideRecord('sys_playbook_activity_renderer');
gr.addNullQuery('active');
gr.setValue('active', true);
gr.updateMultiple();

gr = new GlideRecord('sys_playbook_activity_renderer');
gr.addNullQuery('ui_selector');
gr.addNullQuery('activity_ui');
gr.addNotNullQuery('renderer');
gr.setValue('ui_selector', 'renderer');
gr.updateMultiple();
