var fieldUpdated = false;

var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_process_type');
gr.addQuery('element', 'activity_picker_override');
gr.query();
if (gr.next()) {
    var referenceValue = gr.getValue('reference');
    if (referenceValue === 'sys_ux_macroponent_type') {
        // update metadata
        try {
            gr.setValue('reference', 'sys_ux_macroponent');
            gr.update();
            fieldUpdated = true;
            gs.info('Updated activity_picker_override in sys_pd_process_type successfully');
        } catch (e) {
            gs.error('Error in updating the reference value of activity_picker_override: ' + e.message());
        }
    }
}

if (fieldUpdated) {
    // update data (record)
    var grType = new GlideRecord('sys_pd_process_type');
    var creatorStudioAutomationType = PDConstants.PLAYBOOK_TYPES.CREATOR_STUDIO_AUTOMATION;
    if (grType.get(creatorStudioAutomationType)) {
        var activityPickerValue = grType.getValue('activity_picker_override');
        var creatorStudioActivityPicker = '904e33c88af17cf5d48b0f0814f1348f';
        if (activityPickerValue !== creatorStudioActivityPicker) {
            try {
                grType.setValue('activity_picker_override', creatorStudioActivityPicker);
                grType.update();
                gs.info('Updated Creator Studio Automation in sys_pd_process_type successfully');
            } catch (e) {
                gs.error('Error in updating the value of activity_picker_override for Creator Studio: ' + e.message());
            }
        }
    }
}
