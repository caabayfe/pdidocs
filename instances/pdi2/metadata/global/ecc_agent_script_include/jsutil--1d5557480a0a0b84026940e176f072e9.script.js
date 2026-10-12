/**
 * JavaScript utility functions.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var JSUtil = Class.create();

/*
 * Returns true if the given item is not null and is not undefined.
 */
JSUtil.has = function(item) {
    return (item != null) && (typeof item != 'undefined');
}

/*
 * Returns true if the given item is null or is undefined (the logical inverse of .has(), above).
 */
JSUtil.doesNotHave = function(item) {
    return !JSUtil.has(item);
}

/*
 * Returns true if the given item is null, undefined, or evaluates to the empty string.
 */
JSUtil.nil = function(item) {
    if (JSUtil.isJavaObject(item))
        return (item.toString() == null) || (item.toString() == '');

    return (item == null) || (typeof item == 'undefined') || ('' == '' + item);
}

/*
 * Returns true if the given item exists and is not empty (the logical inverse of .nil(), above).
 */
JSUtil.notNil = function(item) {
    return !JSUtil.nil(item);
}

/*
 *  Returns true if item is defined but has no properties or functions. (handy for associative arrays)
 */
JSUtil.isEmpty = function(item) {
    var result=false;
    if (JSUtil.notNil(item)) {
        result=true;
        for (var i in item) {
            result=false;
            break;
        }
    }
    return result;
}	
	
/*
 * Returns true if the given item is a member of the given class.  For JavaScript objects, this method behaves exactly
 * like the JavaScript operator "instanceof".  However, this method (unlike the JavaScript operator) also tests Java
 * objects.
 * 
 * item: the object to be tested.
 * klass: the class to be tested (for Java objects, must be the complete class name, like "java.util.ArrayList").
 */
JSUtil.instance_of = function(item, klass) {
    if (item == null)
        return false;
    if (!klass)
        return false;
    if (typeof item != 'object')
        return false;
    if (typeof item.getClass() == 'undefined')
        if (klass.indexOf('.') < 0)
            return eval('(item instanceof ' + klass + ')');
        else
            return false;
    return item.getClass().getName() == klass;
}

/*
 * Returns the type of the given value as a string, as follows:
 *   'null'     if the given value is null or undefined
 *   'string'   if the given value is a primitive string or a String wrapper instance
 *   'number'   if the given value is a primitive number or a Number wrapper instance
 *   'boolean'  if the given value is a primitive boolean or a Boolean wrapper instance
 *   'function' if the given value is a function
 *   'object'   otherwise
 */
JSUtil.type_of = function(value) {
    if (value == null)
        return 'null';
        
    var t = typeof value;
    if ((t == 'string') || (t == 'number') || (t == 'boolean') || (t == 'function'))
        return t;
        
    if (value instanceof String)
        return 'string';
        
    if (value instanceof Number)
        return 'number';
        
    if (value instanceof Boolean)
        return 'boolean';
        
    return t;
}

/*
 * Returns true if the given value is an instance of a Java object.
 */
JSUtil.isJavaObject = function(value) {
    if (value == null)
        return false;
        
    if (typeof value != 'object')
        return false;
        
    if (typeof value.hashCode != 'function')
        return false;
        
    if (typeof value.equals != 'function')
        return false;
        
    if (typeof value.getClass != 'function')
        return false;
        
    if (typeof value.notify != 'function')
        return false;
        
    if (typeof value.notifyAll != 'function')
        return false;
        
    if (typeof value.toString != 'function')
        return false;
        
    return true;
}

/*
 * Coerces the given item to a boolean.  If the given item is a boolean, it is passed through.  Non-zero numbers return true.  Null or
 * undefined returns false.  Strings return true only if exactly equal to 'true'.  
 */
JSUtil.toBoolean = function(item) {
    if (!JSUtil.has(item))
        return false;
        
    if (typeof item == 'boolean')
        return item;
        
    if (typeof item == 'number')
        return item != 0;
        
    if ((typeof item == 'string') || ((typeof item == 'object') && (item instanceof String)))
        return item == 'true';
        
    // if we get here then we've got either a non-String object or a function; always return true for these...
    return true;
}

/*
 * Returns the value in a boolean GlideRecord field.
 */
JSUtil.getBooleanValue = function(gr, field) {
    var val = gr.getValue(field);
    return (val == 'true') || (val == '1');
}

/*
 * Logs all the properties in the given object: name, type, and value.  The optional second parameter is a name for the logged object.
 */
JSUtil.logObject = function(obj, name) {
    ms.log('Log Object' + ((name) ? ': ' + name : ''));
    if (typeof obj != 'object' || obj == null) {
        ms.log('  null, undefined, or not an object');
        return;
    }
    // protect against recursive data structures...
    this.log_levels = 0;
    JSUtil._logObject(obj, null, '  ');
}

/*
 * Internal recursive object logger.
 */
JSUtil._logObject = function(obj, name, lead) {
    this.log_levels++;
    if (this.log_levels > 25) {
        this.log_level--;
        ms.log(lead + '<<< recursion levels exceeded 25, ignoring >>>');
        return;
    }
    var value = obj;
    var type = JSUtil.type_of(value);
    if (type == 'object') {
        var ns = (name == null) ? '' : name + ': ';
        if (value instanceof Array) {
            ms.log(lead + ns + 'Array of ' + value.length + ' elements');
            for (var i = 0; i < value.length; i++) {
                var ae = value[i];
                JSUtil._logObject(ae, '[' + i + ']', lead + '  ');
            }
        }
        else {
            if (JSUtil.isJavaObject(obj))
                ms.log(lead + ns + 'Java Object');
            else {
                ms.log(lead + ns + 'Object');
                for (var name in obj) {
                    JSUtil._logObject(obj[name], name, '  ' + lead);
                }
            }
        }
    }
    else 
        ms.log(lead + name + ': ' + type + '; ' + value);
    this.log_levels--;
}

/**
 * Determines whether a value exists within an object or not.
 * @param {} container The haystack to search within.
 * @param {} value The expected needle value to compare against.
 * @param boolean|undefined strictCompare If true, uses === for comparison; == otherwise.
 * @return True if value exists in container, False otherwise.
 */
JSUtil.contains = function(container, value, strictCompare) {
	if (strictCompare) {
		// strict equality
		for (var key in container) {
			if (container[key] === value)
				return true;             
		}
	} else {
		// equality
		for (var key in container) {
			if (container[key] == value)
				return true;             
		}	
	}
	
    return false;
};
	
/*
 * NOTE: between this banner and the following banner, several string literals are specified in an odd way: by the contatenation of a single
 *       character ('&') and the remainder of the HTML entity (such as 'amp;').  This method was employed to avoid having the entities translated 
 *       into the equivalent characters when the script include is edited in the instance.
 */
JSUtil.AMP     = /\&/g;
JSUtil.GT      = /\>/g;
JSUtil.LT      = /\</g;
JSUtil.QT      = /\"/g;
JSUtil.AMP_ENT = new RegExp( '\\&' + 'amp;',  'g' );
JSUtil.GT_ENT  = new RegExp( '\\&' + 'gt;',   'g' );
JSUtil.LT_ENT  = new RegExp( '\\&' + 'lt;',   'g' );
JSUtil.QT_ENT  = new RegExp( '\\&' + 'quot;', 'g' );

JSUtil.escapeText = function(text) {
    var result = ('' + text).replace(JSUtil.AMP, '&' + 'amp;');
    result = result.replace(JSUtil.LT, '&' + 'lt;');
    return result.replace(JSUtil.GT, '&' + 'gt;');
}

JSUtil.unescapeText = function(text) {
    var result = ('' + text).replace(JSUtil.GT_ENT, '>');
    result = result.replace(JSUtil.LT_ENT, '<');
    return result.replace(JSUtil.AMP_ENT, '&');
}

JSUtil.escapeAttr = function(attr) {
    var result = ('' + attr).replace(JSUtil.AMP, '&' + 'amp;');
    return result.replace(JSUtil.QT, '&' + 'quot;');
}

JSUtil.unescapeAttr = function(attr) {
    var result = ('' + attr).replace(JSUtil.QT_ENT, '"');
    return result.replace(JSUtil.AMP_ENT, '&');
}
/*
 * End of odd string construction...
 */

JSUtil.prototype = {
    type: "JSUtil"
};
