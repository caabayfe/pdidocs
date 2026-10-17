(function transform(transformBuilder, transformScriptArgs) {
    try {
        if(!transformBuilder) return;

        var editActionsObj = {
            "remove": []
        };
        
        var listModel = transformBuilder
        .editRowActions(editActionsObj)
        .transform();
        
        return listModel;
    }

    catch(error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
