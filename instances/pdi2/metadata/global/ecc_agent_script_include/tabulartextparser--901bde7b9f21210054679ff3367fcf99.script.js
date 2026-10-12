// Discovery

var TabularTextParser = Class.create();
TabularTextParser.prototype = {
    initialize: function() {
        // set this to a global regular expression that will recognize column separators...
        this.separator = /\s+/g;
        
        // set this false if the last column may NOT conatin separators...
        this.last_column_may_contain_separators = true;
        
        // contains an error message if there was any...
        this.error_msg = null;
    },

    /**
     * Parses the given text, returning an array (one entry per data line) of maps of property name to value.
     * The text may contain more columns than we're actually interested in.  The columns may be separated by 
     * any sequence identifiable in a global regular expression; the default is 1 -> n spaces.  The last column 
     * may optionally contain column separators in its field.  The columns may appear in any order, with the 
     * single exception in the case where the last column may contain separators; obviously in that case that 
     * column must be the last one.  Blank data lines are skipped.  The first line MUST be a line of column 
     * headers.
     * 
     * The columns of interest are given in the columns argument, which must be an array of column info objects
     * with these properties:
     *   header_matcher: a regular expression that will match the column header
     *   prop_name:      the name of the property to use
     *   last:           true if the column must be last (presumably because it may contain column separators)
     *   
     * On a successful completion, the array of line values is returned, and the parser's error_msg property 
     * is null.  If there are any errors, the array of line values is returned, but it may be either empty or
     * missing some rows of data.  In this case, the parser's error_msg property will NOT be null, but will
     * instead contain an error message.
     */
    parse: function(text, columns) {
        var results = [];
        
        // sanity checks...
        if ((text == null) || (columns == null) || (text.length == 0) || (columns.length == 0)) {
            this.error('Invalid inputs to TabularTextProcessor');
            return results;
        }
        
        // first get an array of lines...
        var lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
            this.error('Input doesn\'t include any data (an possibly no headers)');
            return results;
        }
        
        // now parse the first line to get our column headers...
        var headers = this.parse_line(lines[0], 0);
        
        // figure out which (and how many) columns we're interested in...
        var interested = [];
        var max = 0;
        for (var i = 0; i < headers.length; i++) {
            for (var j = 0; j < columns.length; j++) {
                if (columns[j].header_matcher.test(headers[i])) {
                    if ((max > 0) && (i >= max)) {
                        this.error('Column ' + columns[j].prop_name + ' is beyond column specified as the last column');
                        return results;
                    }
                    columns[j].col = i;
                    interested.push(columns[j]);
                    if (columns[j].last)
                        max = i + 1;
                }
            }
        }
        
        // parse all our lines, skipping any empty lines...
        for (var i = 1; i < lines.length; i++) {
            if (!lines[i])
                continue;
            
            var cols = this.parse_line(lines[i], max);
            var map = {};
            for (var j = 0; j < interested.length; j++)
                map[interested[j].prop_name] = cols[interested[j].col];
            results.push(map);
        }
        
        return results;
    },
    
    /**
     * Return an array of the columns contained in the given line of data.  If max is zero, then one entry 
     * is returned for every separated column in the line.  If max is greater than zero, no more than max
     * entries are returned, and the last one will include all remaining data on the line.  Any leading
     * whitespace in the line is ignored.
     */
    parse_line: function(line, max) {
        var ws = /^\s*/.exec(line);
        line = line.substring(ws[0].length);
        var results = [];
        var cur_pos = 0;
        var match = null;
        this.separator.lastIndex = 0;
        while (match = this.separator.exec(line)) {
            results.push(line.substring(cur_pos, match.index));
            cur_pos = this.separator.lastIndex;
            if ((max > 0) && (results.length + 1 >= max))
                break;
        }
        results.push(line.substring(cur_pos));
        return results;
    },
    
    /**
     * Appends the given error message.
     */
    error: function(msg) {
        if (this.error_msg)
            this.error_msg += msg + '\n';
        else
            this.error_msg = msg + '\n';
    },
    
    type: 'TabularTextParser'
};
