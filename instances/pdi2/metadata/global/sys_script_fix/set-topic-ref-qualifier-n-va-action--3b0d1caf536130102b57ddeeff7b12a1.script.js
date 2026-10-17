var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_notification_va_action');
gr.addQuery('element', 'topic');
gr.query();
if (gr.next()) {
    gr.setValue('reference_qual', 'active=true^published=true^libraryISEMPTY^ORlibrary=false^is_system_topicISEMPTY^ORis_system_topic=false');
    gr.update();
}
