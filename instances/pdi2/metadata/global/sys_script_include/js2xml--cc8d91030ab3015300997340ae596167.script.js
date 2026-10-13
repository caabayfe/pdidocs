// Discovery

/**
 * JavaScript to XML serializer and deserializer.
 * 
 * This class provides static methods for converting simple JavaScript values (including objects and arrays) to XML 
 * strings, and vice versa. It handles booleans, numbers, strings, arrays, and objects (as name:value hashmaps). It 
 * does NOT handle functions or typed classes.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var JS2XML = Class.create();

/*
 * Converts the given value to an XML string.  This method is called recursively.
 */
JS2XML.toXML = function(value, name, xml) {
    var result = (xml) ? xml : '';
    var type = typeof value;
    if (type == 'object') {
        if (value == null) 
            type = 'null';
        else if (value instanceof String )
            type = 'string';
        else if (value instanceof Number )
            type = 'number';
        else if (value instanceof Boolean)
            type = 'boolean';
        else if (value instanceof Array)
            type = 'array';
    }
    switch (type) {
        case 'undefined':
            result += JS2XML._toClosedTag('undefined', name);
            break;
        case 'null':
            result += JS2XML._toClosedTag('null', name);
            break;
        case 'boolean':
            result += JS2XML._toOpenTag('boolean', name) + (value ? 'true' : 'false') + JS2XML._toCloseTag('boolean');
            break;
        case 'number':
            result += JS2XML._toOpenTag('number', name) + value + JS2XML._toCloseTag('number');
            break;
        case 'string':
            value = '' + value;
            result += JS2XML._toOpenTag('string', name) + JS2XML.escapeText(value) + JS2XML._toCloseTag('string');
            break;
        case 'array':
            result += JS2XML._toOpenTag('array', name);
            for (var i = 0; i < value.length; i++) {
                var val = value[i];
                result = JS2XML.toXML(val, '' + i, result);
            }
            result += JS2XML._toCloseTag('array');
            break;
        case 'object':
            result += JS2XML._toOpenTag('object', name);
            for (var propname in value) {
                var val = value[propname];
                result = JS2XML.toXML(val, propname, result);
            }
            result += JS2XML._toCloseTag('object');
            break;
        default:
            throw new Error('Unexpected type: ' + type);
            break;
    }
    return result;
}

/*
 * Converts the given XML string to a value.
 */
JS2XML.fromXML = function(xmlStr) {
    var answer;
    var xml = '' + xmlStr;
    _fromXML(null);
    return answer;

    function _fromXML(parent) {
        // parse the first tag in the incoming XML...
        var parser = /(<\/?)([^ >\/]+)(.*?)(\/?>)(.*)/;
        var parsed = parser.exec(xml);
        if (!parsed)
            throw new Error('Invalid XML: ' + xml);

        var opener  = parsed[1];
        var tagName = parsed[2];
        var attrs   = parsed[3];
        var closer  = parsed[4];
        xml         = parsed[5];

        // parse the name, if we have one...
        parser = /.*name="([^"]*)".*/;
        parsed = parser.exec(attrs);
        var name = parsed ? JS2XML.unescapeAttr(parsed[1]) : null;
        var proper = JSUtil.has(parent) && JSUtil.notNil(name);

        // this better be an open tag...
        if (opener != '<')
            throw new Error('Unexpected close tag ' + opener + ': ' + xml);

        switch (tagName) {
            case 'undefined':
                verifyClosedTag();
                setValue(undefined);
                break;
            case 'null':
                verifyClosedTag();
                setValue(null);
                break;
            case 'boolean':
                verifyOpenTag();
                setValue('true' == getValue('boolean'));
                break;
            case 'number':
                verifyOpenTag();
                setValue(getValue('number') - 0);
                break;
            case 'string':
                verifyOpenTag();
                setValue(getValue('string'));
                break;
            case 'array':
                verifyOpenTag();
                var arr = [];
                setValue(arr);
                while (!closeNext('array'))
                    _fromXML(arr);
                break;
            case 'object':
                verifyOpenTag();
                var obj = {};
                setValue(obj);
                while (!closeNext('object'))
                    _fromXML(obj);
                break;
            default:
                throw new Error('Unexpected tag: ' + xml);
                break;
        }

        return result;

        function closeNext(tag) {
            parser = /\s*<\/(\w*)\s*>(.*)/;
            parsed = parser.exec(xml);
            var result = parsed && parsed[1] == tag;
            if (result)
                xml = parsed[2];
            return result;
        }

        function setValue(value) {
            if (proper) {
                if (parent instanceof Array)
                    parent[name - 0] = value;
                else
                    parent[name] = value;
            } else
                answer = value;
        }

        function getValue(tag) {
            parser = /\s*(.*?)\s*<\/(\w+)\s*>(.*)/;
            parsed = parser.exec(xml);
            if (!parsed || parsed[2] != tag)
                throw new Error('No close tag ' + tag + ': ' + xml);

            xml = parsed[3];
            return JS2XML.unescapeText(parsed[1]);
        }

        function verifyClosedTag() {
            if (closer != '/>')
                throw new Error('Expected closed tag: ' + xml);
        }

        function verifyOpenTag() {
            if (closer != '>')
                throw new Error('Expected open tag: ' + xml);
        }
    }
}

JS2XML._toClosedTag = function(tag, name) {
    return JS2XML._toStartTag(tag, name) + '/>';
}

JS2XML._toOpenTag = function(tag, name) {
    return JS2XML._toStartTag(tag, name) + '>';
}

JS2XML._toCloseTag = function(tag) {
    return '</' + tag + '>';
}

JS2XML._toStartTag = function(tag, name) {
    return '<' + tag + (JSUtil.nil(name) ? '' : ' name="' + JS2XML.escapeAttr(name) + '"');
}

/*
 * NOTE: between this banner and the following banner, several string literals are specified in an odd way: by the 
 *       contatenation of a single character ('&') and the remainder of the HTML entity (such as 'amp;'). This method 
 *       was employed to avoid having the entities translated into the equivalent characters when the script include is 
 *       edited in the instance.
 */
JS2XML.AMP     = /\&/g;
JS2XML.GT      = /\>/g;
JS2XML.LT      = /\</g;
JS2XML.QT      = /\"/g;
JS2XML.AMP_ENT = new RegExp('\\&' + 'amp;', 'g');
JS2XML.GT_ENT  = new RegExp('\\&' + 'gt;',  'g');
JS2XML.LT_ENT  = new RegExp('\\&' + 'lt;',  'g');
JS2XML.QT_ENT  = new RegExp('\\@quote\\@',  'g');

JS2XML.escapeText = function(text) {
    var result = ('' + text).replace(JS2XML.AMP, '&' + 'amp;');
    result = result.replace(JS2XML.LT, '&' + 'lt;');
    return result.replace(JS2XML.GT, '&' + 'gt;');
}

JS2XML.unescapeText = function(text) {
    var result = ('' + text).replace(JS2XML.GT_ENT, '>');
    result = result.replace(JS2XML.LT_ENT, '<');
    return result.replace(JS2XML.AMP_ENT, '&');
}

JS2XML.escapeAttr = function(attr) {
    var result = ('' + attr).replace(JS2XML.AMP, '&' + 'amp;');
    return result.replace(JS2XML.QT, '@quote@');
}

JS2XML.unescapeAttr = function(attr) {
    var result = ('' + attr).replace(JS2XML.QT_ENT, '"');
    return result.replace(JS2XML.AMP_ENT, '&');
}
/*
 * End of odd string construction...
 */

JS2XML.prototype = {
    type: "JS2XML"
};
