function validate(value) {
    if (value == "")
       return true;

    var code = value;
    code = removeCommentsFromClientScript(code);

    // take out the double quote strings, we do not want to check them
    var doubleQuotePattern = /"[^"\r\n]*"/g;
    code = code.replace(doubleQuotePattern,""); 

    // take out the single quote strings, we do not want to check them either
    var singleQuotePattern = /'[^'\r\n]*'/g;
    code = code.replace(singleQuotePattern,"");

    // take out equality tests
    var equalityPattern = /(={3}|={2})/g;
    code = code.replace(equalityPattern,"");

    // take out != <= >=
    var otherEqualsPattern = /(!=|<=|>=)/g;
    code = code.replace(otherEqualsPattern,"");

    // are there any single equal signs?
    if (code.indexOf("=") > -1) {
       // permit assignment if a var is declared, we'll assume you know what you're doing
       var varPattern = /var\s+\S+\s*=/;
       if (!varPattern.test(code))
          return new GwtMessage().getMessage("Use two equal signs to test equality; conditions should not do assignment");
    }

    var ajax = new GlideAjax('JSValidator');
    ajax.addParam('sysparm_name','validate');
    ajax.addParam('sysparm_js_expression',value);
    ajax.getXMLWait();
    var answer = ajax.getAnswer();
    if (answer == null)
        return true;

    return answer;
}
