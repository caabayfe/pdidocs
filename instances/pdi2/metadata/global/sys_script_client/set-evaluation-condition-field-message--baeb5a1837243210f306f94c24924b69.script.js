
      
            function onChange(control, oldValue, newValue, isLoading, isTemplate) {
                if (isLoading) {
                    return;
                }
                var evaluationConditionField = "interoperable_condition";
                getMessage("Only supports encoded queries with route fields", function(translatedMsg) {
                    g_form.showFieldMsg(evaluationConditionField, translatedMsg);
                });
            }
