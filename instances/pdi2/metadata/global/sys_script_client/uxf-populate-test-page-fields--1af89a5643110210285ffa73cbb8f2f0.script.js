function onLoad() {
    addRenderEvent(function() {
        var event = (function event(control, oldValue, newValue, isLoading, isTemplate) {
            var hiddenParentMacroponentField = 'hidden_parent_macroponent';
            // Hide the parent macroponent input
            g_form.setDisplay(hiddenParentMacroponentField, false);

            var hiddenFunctionDescription = 'hidden_function_description';
            // Hide the function description
            g_form.setDisplay(hiddenFunctionDescription, false);

            var componentField = 'component';
            g_form.setReadOnly(componentField, true);

            var functionField = 'function_to_call';
            g_form.setReadOnly(functionField, true);

            var actionParameters = 'action_parameters';
            var actionReturns = 'returns';

            g_form.setDisplay(functionField, true);
            g_form.setDisplay(actionParameters, 'true');
            g_form.setDisplay(actionReturns, 'true');

            //Set description on load
            var loadedSelectedOption = g_form.getValue(functionField);
            if (loadedSelectedOption) {
                var description = g_form.getOption(functionField, loadedSelectedOption).textContent;
                g_form.setValue(hiddenFunctionDescription, description);
            }

        });

        var thisHandler = new GlideEventHandler('event', event, 'sys_atf_step.inputs.var__m_atf_input_variable_33bb3cb343810210285ffa73cbb8f245.component');
        g_event_handlers.push(thisHandler);
    });
}
