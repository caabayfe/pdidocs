function updateAppletRefQualOfIconSection() {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_sg_icon_section');
    gr.addQuery('element', 'applets');
    gr.query();
    if (!gr.next())
        return;
	
    gr.setValue('reference_qual', "javascript: new SGParameterScreenHelper().getFilteredScreenRefQual();");
    gr.setWorkflow(false);
    gr.update();
}

updateAppletRefQualOfIconSection();
