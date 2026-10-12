function onSubmit() {
    //Type appropriate comment here, and begin script below

    try {
        var restVariableArray = [];

        $j("label[id*=_rest_var_variable]").each(function() {
            var restVarId = $j(this).attr('for');
            var restVarName = $j(this).data('rest-var-name');
            restVariableArray.push({
                id: restVarId,
                name: restVarName
            });
        });

        if (restVariableArray.length > 0) {
            var restVariables = businessRuleREST.setRESTVariablesFieldOnSubmit(restVariableArray);
            g_form.setValue('rest_variables', restVariables);
        }
    } catch (err) {
        //Do nothing if the external JS isn't found.
        //This case happens when business rule is edited in mergetool
    }
}
