(function (engine) {

    checkInsecureGlideRecordCalls('sys_script_include', ['script'],                    'active=true^client_callable=true^scriptLIKEGlideRecord^scriptNOT LIKEGlideRecordSecure^scriptNOT LIKEcanExecute^scriptNOT LIKEcanRead^scriptNOT LIKEcanWrite^scriptNOT LIKEcanDelete^scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sys_script',         ['script'],                    'collection=global^client_callable=true^scriptLIKEGlideRecord^scriptNOT LIKEGlideRecordSecure^scriptNOT LIKEcanExecute^scriptNOT LIKEcanRead^scriptNOT LIKEcanWrite^scriptNOT LIKEcanDelete^scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sys_processor',      ['script'],                    'active=true^type=script^scriptLIKEGlideRecord^scriptNOT LIKEGlideRecordSecure^scriptNOT LIKEcanExecute^scriptNOT LIKEcanRead^scriptNOT LIKEcanWrite^scriptNOT LIKEcanDelete^scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sys_ws_operation',   ['operation_script'],          'active=true^operation_scriptLIKEGlideRecord^operation_scriptNOT LIKEGlideRecordSecure^operation_scriptNOT LIKEcanExecute^operation_scriptNOT LIKEcanRead^operation_scriptNOT LIKEcanWrite^operation_scriptNOT LIKEcanDelete^operation_scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sys_web_service',    ['script'],                    'active=true^scriptLIKEGlideRecord^scriptNOT LIKEGlideRecordSecure^scriptNOT LIKEcanExecute^scriptNOT LIKEcanRead^scriptNOT LIKEcanWrite^scriptNOT LIKEcanDelete^scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sp_widget',          ['script'],                    'scriptLIKEGlideRecord^scriptNOT LIKEGlideRecordSecure^scriptNOT LIKEcanExecute^scriptNOT LIKEcanRead^scriptNOT LIKEcanWrite^scriptNOT LIKEcanDelete^scriptNOT LIKEcanCreate');
    checkInsecureGlideRecordCalls('sys_ui_page',        ['html', 'processing_script'], 'htmlLIKEGlideRecord^htmlNOT LIKEGlideRecordSecure^htmlNOT LIKEcanExecute^htmlNOT LIKEcanRead^htmlNOT LIKEcanWrite^htmlNOT LIKEcanDelete^htmlNOT LIKEcanCreate^NQprocessing_scriptLIKEGlideRecord^processing_scriptNOT LIKEGlideRecordSecure^processing_scriptNOT LIKEcanExecute^processing_scriptNOT LIKEcanRead^processing_scriptNOT LIKEcanWrite^processing_scriptNOT LIKEcanDelete^processing_scriptNOT LIKEcanCreate');

    function checkInsecureGlideRecordCalls(tableName, scriptFields, query) {
        if (typeof scriptFields == 'string') {
            scriptFields = [scriptFields];
        }

        // get all active CCSIs that use GlideRecord but neither GlideRecordSecure nor canExecute, canRead, canWrite, canDelete, or canCreate 
        var grRecord = new GlideRecord(tableName);
        grRecord.addEncodedQuery(query);
        grRecord.query();
        while (grRecord.next()) {
            var grVersion = new GlideRecord('sys_update_version');
            grVersion.addQuery('name', '=', tableName +'_'+ grRecord.sys_id);
            grVersion.addEncodedQuery('source_table!=sys_upgrade_history^source_table!=sys_store_app^state=current');
            grVersion.setLimit(1);
            grVersion.query();

            var grUpdate = new GlideRecord('sys_update_xml');
            grUpdate.addQuery('name', '=', tableName +'_'+ grRecord.sys_id);
            grUpdate.setLimit(1);
            grUpdate.query();

            // check if record has version or update XML (so it's custom), otherwise skip!
            if (!grVersion.next() && !grUpdate.next()) continue;

            for (var i in scriptFields) {
                var code = grRecord[scriptFields[i]] +'';

                var glideRecordOccurences     = getFunctionCallParameters(code, 'GlideRecord');
                var addEncodedQueryOccurences = getFunctionCallParameters(code, 'addEncodedQuery');

                var legitimateOccurences = [];


                for (var o in glideRecordOccurences) {
                    var glideRecordOccurence = glideRecordOccurences[o];
                    if (glideRecordOccurence.params[0].isToken || glideRecordOccurence.params[0].isSimpleCall) {
                        if (glideRecordOccurence.params[0].isToken) {
                            var variableName = glideRecordOccurence.params[0].value;
                            if (variableName.startsWith('this.')) {
                                variableName = variableName.substring('this.'.length);
                            }
                            var assignment = findlastAssignmentAssignment(code.substring(0, glideRecordOccurence.index), variableName);
                            if (assignment != null && assignment != '') {
                                var assignmentValue = assignment.substring((assignment.indexOf('=') >= 0 ? assignment.indexOf('=') : assignment.indexOf(':')) +1);
                                    assignmentValue = assignmentValue.trim();
                                    if (assignmentValue.endsWith(';') || assignmentValue.endsWith(',')) {
                                        assignmentValue = assignmentValue.substring(0, assignmentValue.length -1);
                                    }
                                    if (assignmentValue != null && assignmentValue != '' && !isJavaScriptSring(assignmentValue)) {
                                        legitimateOccurences.push({occurence: glideRecordOccurence, assignment: assignment});
                                    }
                            }
                        } else {
                            legitimateOccurences.push({occurence: glideRecordOccurence});
                        }
                    }
                }
                
                for (var o in addEncodedQueryOccurences) {
                    var addEncodedQueryOccurence = addEncodedQueryOccurences[o];
                    if (addEncodedQueryOccurence.params[0].isToken || addEncodedQueryOccurence.params[0].isSimpleCall) {
                        if (addEncodedQueryOccurence.params[0].isToken) {
                            var variableName = addEncodedQueryOccurence.params[0].value;
                            if (variableName.startsWith('this.')) {
                                variableName = variableName.substring('this.'.length);
                            }
                            var assignment = findlastAssignmentAssignment(code.substring(0, addEncodedQueryOccurence.index), variableName);
                            if (assignment != null && assignment != '') {
                                var assignmentValue = assignment.substring((assignment.indexOf('=') >= 0 ? assignment.indexOf('=') : assignment.indexOf(':')) +1);
                                    assignmentValue = assignmentValue.trim();
                                    if (assignmentValue.endsWith(';') || assignmentValue.endsWith(',')) {
                                        assignmentValue = assignmentValue.substring(0, assignmentValue.length -1);
                                    }
                                    if (assignmentValue != null && assignmentValue != '' && !isJavaScriptSring(assignmentValue)) {
                                        legitimateOccurences.push({occurence: addEncodedQueryOccurence, assignment: assignment});
                                    }
                            }
                        } else {
                            legitimateOccurences.push({occurence: addEncodedQueryOccurence});
                        }
                    }
                }

                if (legitimateOccurences.length > 0) {
                    finding.setCurrentSource(grRecord);

                    var output = [];
                    output.push('CHECK field "'+ scriptFields[i] +'":');

                    legitimateOccurences.sort(function(a, b) {
                        return a.occurence.line - b.occurence.line
                    });

                    for (var o in legitimateOccurences) {
                        finding.increment();
						
                        var legitimateOccurence = legitimateOccurences[o];
                        var occurence = legitimateOccurence.occurence;
                        var assignment = legitimateOccurence.assignment;
                        output.push('\t- line: '+ occurence.line +': '+ occurence.variable + (occurence.variable == '' ? '' : ' = ') + occurence.match);
                        if (assignment) output.push('\t\twhere '+ assignment);
                    }

                    finding.setValue('finding_details', output.join('\n'));
                }
            }
        }
    }

    /* ------------------------------------------------------------------------- */

    /**
     * Naive function to find the last occurence of {variable}: ... or {variable} = ...
     * @param {string} code - the code to look for the assignment
     * @param {string} variable - the variable to look for being assigned in the code
     * @param {number} [indexToStopAt] - the index up to which the code will be analysed
     * @returns {string} - the whole match of {variable}: ... or {variable} = ... until the end of the assignment statement
     */
    function findlastAssignmentAssignment(code, variable, indexToStopAt) {
        if (code == '' || variable == '') {
            return '';
        }
        indexToStopAt = indexToStopAt || code.length;
        code = code.substring(0, indexToStopAt);

        variableRegEx = new RegExp(variable.replace(/\./, '\\.') +'\\s*(=|:)[^=;\\n]*', 'g');
        var match = null;
        var lastMatch = null;
        while ((match = variableRegEx.exec(code)) != null) {
            lastMatch = code.substring(match.index);

            var assignmentSign = lastMatch.indexOf('=') >= 0 ? lastMatch.indexOf('=') : lastMatch.indexOf(':');
            var assignmentEnd  = (/[;,\n]/igm.exec(lastMatch) || {index: lastMatch.length}).index;

            lastMatch = lastMatch.substring(0, assignmentEnd);
        }

        return lastMatch;
    }

    /**
     * returns if the code given is a valid JavaScript token (variable name, including dots) or not
     * 
     * @param {string} code - the code to analyse
     * @returns {boolean}
     */
    function isJavaScriptToken(code) {
        return /^[a-z$_.][a-z0-9$_.]*$/ig.test(code);
    }

    /**
     * returns if the code given is a valid JavaScript string
     * 
     * @param {string} code - the code to analyse
     * @returns {boolean}
     */
    function isJavaScriptSring(code) {
        code = code.trim();
        return (code.startsWith('"') && code.endsWith('"')) || (code.startsWith("'") && code.endsWith("'"));
    }

    /**
     * returns if the code given is a a simple function call with just another parameter as a string or a token
     * 
     * @param {string} code - the code to analyse
     * @returns {boolean}
     */
    function isSimpleCall(code) {
        return /^[a-z0-9$_.]+\(['"]?[a-z0-9$_.]+['"]?\)$/ig.test(code);
    }

    /**
     * returns the line number of where the index is located
     * 
     * @param {string} code - the code to analyse
     * @param {number} index - the index to stop at when counting
     * @returns {number}
     */
    function countLines(code, index) {
        index = index || code.length;
        return code.substring(0, index).replace(/(\r\n|\n\r)/ig, '\n').replace(/\r/ig, '\n').split('\n').length;
    }

    /**
     * finds all glideRecordOccurences of a function call and returns for each glideRecordOccurence the actual function call, the line number, and the respective parameters
     * 
     * @param {string} code - the code to analyse
     * @param {string} functionName - the function name to look for (can also contain dots)
     * @returns {array} - an array of objects of the form {index: number, line: number, match: string, params: array of objects like {value: string, variable: string, isToken: boolean, isSimpleCall: boolean}}
     */
    function getFunctionCallParameters(code, functionName) {
        var params = [];
        var fnRegEx = new RegExp('[=:\\(]?\\s*(new\\s*)?'+ functionName.replace(/\./, '\\.') +'\\s*\\(', 'g');

        var match = null;
        while ((match = fnRegEx.exec(code)) != null) {
            var fnCallglideRecordOccurence = {
                index:    match.index,
                line:     countLines(code, match.index),
                match:    '',
                variable: '',
                params:   []
            }

            var variableCode = code.substring(0, match.index);
                variableCode = variableCode.substring(Math.max(variableCode.lastIndexOf('\n'), variableCode.lastIndexOf('\r'), variableCode.lastIndexOf(';')) +1);
                variableCode = variableCode.replace(/(var|let)/ig, '').trim();
                variableCode = variableCode.endsWith('.') ? variableCode.substring(0, variableCode.length -1) : variableCode;

            fnCallglideRecordOccurence.variable  = variableCode;

            var fnCallStart = match.index + match[0].length;
            var fnCallEnd   = fnCallStart;

            var paranthesesCount = 0;
            for (var i = fnCallStart; i < code.length; i++) {
                if (code.charAt(i) == '(') paranthesesCount++;
                if (code.charAt(i) == ')') paranthesesCount--;

                if (paranthesesCount == -1) {
                    fnCallEnd = i;
                    break;
                }
            }

            var fnCall = code.substring(fnCallStart, fnCallEnd);
            fnCallglideRecordOccurence.match = match[0].substring(match[0].indexOf(functionName)) + fnCall +')';

            paranthesesCount = 0;
            for (var i = 0; i < fnCall.length; i++) {
                if (fnCall.charAt(i) == '(') paranthesesCount++;
                if (fnCall.charAt(i) == ')') paranthesesCount--;

                var paramValue = '';
                if (paranthesesCount == 0 && fnCall.charAt(i) == ',') {
                    paramValue = fnCall.substring(0, i).trim();

                    fnCall = fnCall.substring(i +1);
                    i = 0;
                } else if (paranthesesCount == 0 && i == fnCall.length -1) {
                    paramValue = fnCall.substring(0, i +1).trim();
                }
                
                if (paramValue != '') {
                    fnCallglideRecordOccurence.params.push({
                        value:        paramValue,
                        isToken:      isJavaScriptToken(paramValue),
                        isSimpleCall: isSimpleCall(paramValue)
                    });
                }
            }

            params.push(fnCallglideRecordOccurence);
        }

        return params;
    }

    /**
     * for static code analysis, this function removes any hard-coded strings and any comments (in-line and line-end comments)
     * 
     * @param {string} code 
     * @returns {string} cleaned-up code
     */
    function stripStringsAndComments(code) {
        var i = 0;
        while (i < code.length) {
            // remove double qouted strings
            if (code.charAt(i) == '"') {
                var doubleQuoteStart = i;
                var doubleQuoteEnd   = i +1;

                while (doubleQuoteEnd < code.length) {
                    if (code.charAt(doubleQuoteEnd) == '\\') {
                        doubleQuoteEnd++;
                    } else if (code.charAt(doubleQuoteEnd) == '"') {
                        break;
                    }
                    doubleQuoteEnd++;
                }

                code = code.substring(0, doubleQuoteStart) +' '+ code.substring(doubleQuoteEnd +1);
            }

            // remove single qouted strings
            if (code.charAt(i) == "'") {
                var singleQuoteStart = i;
                var singleQuoteEnd   = i +1;

                while (singleQuoteEnd < code.length) {
                    if (code.charAt(singleQuoteEnd) == '\\') {
                        singleQuoteEnd++;
                    } else if (code.charAt(singleQuoteEnd) == "'") {
                        break;
                    }
                    singleQuoteEnd++;
                }

                code = code.substring(0, singleQuoteStart) +' '+ code.substring(singleQuoteEnd +1);
            }

            // remove in-line comments
            if (code.substring(i, i +2) == '/*') {
                var commentStart = i;
                var commentEnd   = i +2;
                var comment      = '';

                while (commentEnd < code.length) {
                    if (code.substring(commentEnd, commentEnd +2) == '*/') {
                        break;
                    }
                    commentEnd++;
                }
                comment = code.substring(commentStart, commentEnd);

                // keep number of lines intact by replacing everything in the comments but line breaks
                code = code.substring(0, commentStart) + comment.replace(/[^\n\r]/ig, '') + code.substring(commentEnd +2);
            }

            i++;
        }

        // replace line-end comments with nothing
        code = code.replace(/\/\/[^\n]*(\n|\r\n|\n\r\\r)/ig, '$1');

        // if strings were concatenated, remove Pluses (+) directly after openening parentheses or equal signes, or directly before closing parentheses, semi-colons, line-ends, and commas
        code = code.replace(/\+\s+\+/ig, '+').replace(/([(,=])\s*\++/ig, '$1').replace(/\++\s*([),;\n])/ig, '$1');

        // after cleaning-up, replace "empty" assignments and returns with assignments and returns to empty strings
        code = code.replace(/(=|:)\s+(\n|;|\))/ig, '$1 ""$2').replace(/:\s+(,|\})/ig, ': ""$1').replace(/(\s+):/ig, '$1"":').replace(/\[\s+\]/ig, '[""]').replace(/return\s+(\n|;)/ig, 'return ""$1');

        // after cleaning-up, replace "empty"/broken function calls with function calls using empty strings
        code = code.replace(/\(\s+\)/ig, '("")').replace(/\(\s+,/ig, '("",').replace(/,\s+,/ig, ', "",').replace(/,\s+\)/ig, ', "")');

        return code;
    }

})(engine);
