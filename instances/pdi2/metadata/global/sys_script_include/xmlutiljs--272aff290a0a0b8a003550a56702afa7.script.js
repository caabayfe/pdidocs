// Discovery

var XMLUtilJS = Class.create();

XMLUtilJS.escapeForXMLText = function(str) {
    var result =    str.replace( /\&/g, '&amp;' );
    result     = result.replace( /\</g, '&lt;'  );
    result     = result.replace( /\>/g, '&gt;'  );
    return result;
}

XMLUtilJS.unescapeForXMLText = function(str) {
    var result =    str.replace( /\&amp;/g, '&' );
    result     = result.replace( /\&lt;/g,  '<' );
    result     = result.replace( /\&gt;/g,  '>' );
    return result;
}

XMLUtilJS.valueToString = function(val) {
    var result = val;
    if (result == null)
        result = 'NULL';
    result = '' + result;
    result = XMLUtilJS.escapeForXMLText(result);
    return result;
}

XMLUtilJS.stringToValue = function(str) {
    return (str == 'NULL') ? null : XMLUtilJS.unescapeForXMLText('' + str);
}

XMLUtilJS.prototype = {
    type: 'XMLUtilJS'
}
