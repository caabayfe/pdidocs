var gr = new GlideRecord('sys_cs_branding_setup');
gr.query();
gr.setValue('unread_conversation_count_display_enabled', true);
gr.updateMultiple();
