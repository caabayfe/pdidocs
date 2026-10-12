function updateDestinationScreenRefQualOfButton() {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_sg_button');
    gr.addQuery('element', 'destination_screen');
    gr.query();
    if (!gr.next())
        return;
	
    gr.setValue('reference_qual', "javascript: new SGParameterScreenHelper().getFilteredScreenRefQual();");
    gr.setWorkflow(false);
    gr.update();
}

updateDestinationScreenRefQualOfButton();
