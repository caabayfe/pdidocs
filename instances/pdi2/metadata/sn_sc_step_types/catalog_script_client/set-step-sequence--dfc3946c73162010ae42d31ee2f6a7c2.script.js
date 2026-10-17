function onChange(control, oldValue, newValue, isLoading) {
    var mode = localStorage.getItem('sc_service_fulfillment_step_mode');
    var sf_action = localStorage.getItem('sc_service_fulfillment_action');
    var sf_prev_stage = localStorage.getItem('sc_service_fulfillment_previous_stage');
    var sf_current_stage = localStorage.getItem('sc_service_fulfillment_current_stage');
    var isGrouped = localStorage.getItem('is_sc_service_fulfillment_step_grouped') == 'true';
    if (isLoading) {
        if (mode == "edit") {
            if (isGrouped) {
                g_form.setValue('sequence', 'with_previous');
            }
            g_form.setValue('service_fulfillment_stage', sf_current_stage);
            g_form.setReadOnly('service_fulfillment_stage', true);
            g_form.setReadOnly('service_fulfillment_step_configuration', true);
        } else {
            if (sf_action)
                g_form.setValue('service_fulfillment_step_configuration', sf_action);
            // Asuming default value of sequence is after previous, so create a new stage
            g_form.setValue('service_fulfillment_stage', '');
        }
        // If no previous stage, disable sequence
		g_form.setReadOnly('sequence', !sf_prev_stage);
        return;
    }

    if (mode == 'edit') {
        if (isGrouped) {
            if ('with_previous' == newValue)
                g_form.setValue('service_fulfillment_stage', sf_current_stage);
            else
                g_form.setValue('service_fulfillment_stage', '');
        } else {
            if ('with_previous' == newValue)
                g_form.setValue('service_fulfillment_stage', sf_prev_stage);
            else
                g_form.setValue('service_fulfillment_stage', sf_current_stage);
        }
    } else {
        if ('with_previous' == newValue)
            g_form.setValue('service_fulfillment_stage', sf_prev_stage);
        else
            g_form.setValue('service_fulfillment_stage', '');

    }

}
