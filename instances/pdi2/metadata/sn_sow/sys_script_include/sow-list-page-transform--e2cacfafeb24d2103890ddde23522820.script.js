(function transform(transformBuilder, transformScriptArgs) {
    try {
        return new sn_sow.SOWListTransform().transform(transformBuilder, transformScriptArgs);
    }
    // do not remove
    catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
