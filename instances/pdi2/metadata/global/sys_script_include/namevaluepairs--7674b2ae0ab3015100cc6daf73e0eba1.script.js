// Discovery
gs.include("PrototypeServer");

/*
 * Converts between maps and strings representing the name/value pairs in the map. The string form is:
 *    <name>=<value>,<name>=<value,...
 * where <name> is a string name, optionally surrounded by double quotes (Microsoft-style), and <value> is a string
 * value, also optionally surrounded by double quotes. The following are all examples of valid name/value strings:
 *    name=value
 *    name="My Value",name=value
 *    "My Name=this"="My Value","My Value, all the time",name=value
 *    "My Name"="This ""name""",name=value
 * Note in particular the third example, wherein the quoted values contain equals and commas, and the fourth example,
 * wherein the quoted value contains a quote. Instances have the following properties initialized:
 * 
 * map:    the map (JavaScript object being used as a hashmap) form of the name/value pairs, with Microsoft-style 
 *         quotes removed
 * string: the string form of the name/value pairs, with Microsoft-style quoting.
 */
var NameValuePairs = Class.create();

NameValuePairs.prototype = {
    /*
     * Initializes this instance from the given values, which may be either in string form or in map form.
     */
    initialize: function(values) {
        this.map = null;
        this.string = null;
        if ((values instanceof String) || (typeof values == 'string')) {
            this.string = values;
            this.stringToMap();
        } else {
            this.map = values;
            this.mapToString();
        }
    },

    /*
     * Produce this.string from this.map.
     */
    mapToString: function() {
        var parts = [];
        for (var name in this.map) {
            var value = this.map[name];
            if (parts.length > 0)
                parts.push(',');
            parts.push(this.quotify(name));
            parts.push('=');
            parts.push(this.quotify(value));
        }
        this.string = parts.join('');
    },

    /*
     * Produce this.map from this.string.
     */
    stringToMap: function() {
        // first we tokenize and clean up any doubled-up quotes...
        var parser = /([^=,"]+)|(?:"((?:[^"]|"")+)")|([=,])/g;
        var tokens = [];
        var tokenMatch;
        while ((tokenMatch = parser.exec(this.string))) {
            if (tokenMatch[1])
                tokens.push(tokenMatch[1]);
            else if (tokenMatch[2])
                tokens.push(tokenMatch[2].replace(/""/g,'"'));
            else if (tokenMatch[3])
                tokens.push(tokenMatch[3]);
        }

        // now we analyze our tokens...
        var result = {};
        for (var i = 0; i < tokens.length - 2; ) {
            if (tokens[i+1] != '=') 
                break;
            result[tokens[i]] = tokens[i+2];
            i += 3;
            if (i < tokens.length) {
                if (tokens[i] != ',')
                    break;
                i++;
            }
        }
        this.map = result;
    },

    /*
     * If the given value contains double quotes, equals, commas, or spaces, surround the value with double quotes and double up
     * any enclosed double quotes.
     */
    quotify: function(value) {
        // if there are no special characters, just return with our original value...
        if (!value.match(/["=, ]/))
            return value;

        // first double up (Microsoft-style) any double quotes...
        var newValue = value.replace(/"/g, '""');

        // then return a quoted value...
        return '"' + newValue + '"';
    },

    type: 'NameValuePairs'
}
