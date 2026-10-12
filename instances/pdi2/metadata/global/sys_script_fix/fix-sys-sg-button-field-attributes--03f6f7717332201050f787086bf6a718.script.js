addSGElementParameterMapperAttribute();

function addSGElementParameterMapperAttribute() {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_sg_button');
    gr.addQuery('element', 'offline_template_field');
    gr.query();
    if (!gr.next())
        return;

    gr.setValue('attributes', 'allow_journal=true,element_mapping_provider=com.glide.sg.parameter_mapping.SGElementParameterMapper');
    gr.setWorkflow(false);
    gr.update();
}
