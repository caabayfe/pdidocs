var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_gen_ai_skill');
gr.addQuery('element', 'skill_name');
gr.addQuery('internal_type', 'string');
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
    gr.setValue('internal_type', 'translated_text');
    gr.update();
}
