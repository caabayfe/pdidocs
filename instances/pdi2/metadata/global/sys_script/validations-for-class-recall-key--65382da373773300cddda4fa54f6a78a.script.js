(function executeRule(current, previous /*null when async*/ ) {

    // Validate only if the selected parameter key is Class-Recall
    if (current.solution_parameters.getRefRecord().getValue('key') !== 'Class-Recall') {
        return;
    }

    try {
        performValidations(current);
    } catch (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }

    function performValidations(current) {

        // 1. Check if class Recall is already defined for this solution. This check is applicable only for record insertion.
        if (current.operation() === 'insert') {
            var gr = new GlideRecord('ml_advanced_solution_settings');
            gr.addQuery('ml_capability_definition', current.ml_capability_definition);
            gr.addQuery('solution_parameters.key', 'Class-Recall');
            gr.query();
            if (gr.next())
                throw (gs.getMessage("Class-Recall key has already been defined for this solution"));
        }



        /* 
         *	2.Validate the class-recall format.
         *    The format should be ClassName:RecallValue
         *    ClassName can contain any characters except ':'
         *    RecallValue should be an integer between 0 and 100.
         */
		
        var userInputs = current.getValue('user_inputs');
        var regexFormatForRecallUserInput = /^[^:]+:((100)|(0*\d{1,2}))$/;
        if (!regexFormatForRecallUserInput.test(userInputs))
            throw (gs.getMessage("User Inputs format should be ClassName:RecallValue. RecallValue should be an integer betweem 0 and 100. Multiple ClassName:RecallValue are not allowed. "));

    }

})(current, previous);
