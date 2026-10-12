(function executeRule(current, previous /*null when async*/ ) {

    // A script-include or function name is a plain JS identifier. Anything else
    // (dots, semicolons, whitespace, quotes) can only be an attempt to break out
    // of the "new <scope>.<name>()" expression that is evaluated below, so it is
    // rejected before it can reach the Function constructor.
    var JS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

    var contextVal = current.context;
    var scopeSysId = contextVal.target_scope;
    var siName = contextVal.target_script_include_name;
    var fnName = contextVal.target_script_include_function;

    if (!scopeSysId || !siName || !fnName) {
        return;
    }

    if (!JS_IDENTIFIER.test(siName)) {
        gs.error('Document Conversion Pdf2Img Callback: invalid target_script_include_name: ' + siName);
        return;
    }
    if (!JS_IDENTIFIER.test(fnName)) {
        gs.error('Document Conversion Pdf2Img Callback: invalid target_script_include_function: ' + fnName);
        return;
    }

    var event = {
        "sys_id": current.sys_id.toString(),
        "conv_status": current.conv_status.toString(),
        "conversion_start_time": current.conversion_start_time.toString(),
        "conversion_end_time": current.conversion_end_time.toString(),
        "message": current.message.toString(),
        "conversion_time": current.conversion_time.toString()
    };
    // eventArg/contextArg are passed in as actual argument values (never
    // concatenated into the function body as code text), so their content
    // cannot influence what code gets executed.
    var callback;
    if (scopeSysId.toLowerCase().includes('global')) {
        callback = Function("eventArg", "contextArg", "return new global." + siName + "()." + fnName + "(eventArg, contextArg);");
    } else {
        var gr = new GlideRecord('sys_scope');
        if (!gr.get(scopeSysId)) {
            gs.error('Document Conversion Pdf2Img Callback: scope record not found for sys_id ' + scopeSysId);
            return;
        }
        var scope = gr.scope;
        gs.info('Scope name: ' + scope);
        if (!JS_IDENTIFIER.test(scope)) {
            gs.error('Document Conversion Pdf2Img Callback: invalid scope name: ' + scope);
            return;
        }
        callback = Function("eventArg", "contextArg", "return new " + scope + "." + siName + "()." + fnName + "(eventArg, contextArg);");
    }
    try {
        var fnResult = callback.call(this, event, contextVal);
        gs.info('Document Conversion Pdf2Img Callback: invoked ' + siName + '.' + fnName + ', result: ' + fnResult);
    } catch (e) {
        gs.error('Document Conversion Pdf2Img Callback: failed to invoke ' + siName + '.' + fnName + ' - ' + e.message);
    }
})(current, previous);
