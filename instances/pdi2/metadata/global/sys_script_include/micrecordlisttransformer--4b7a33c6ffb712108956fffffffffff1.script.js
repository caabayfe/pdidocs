(function transform(transformBuilder, transformScriptArgs) {

    if (!transformBuilder) return;

    try {

        var helper = new MICRecordListHelper(transformBuilder, transformScriptArgs);
        return helper.transform();

    } catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }

})(transformBuilder, transformScriptArgs);
