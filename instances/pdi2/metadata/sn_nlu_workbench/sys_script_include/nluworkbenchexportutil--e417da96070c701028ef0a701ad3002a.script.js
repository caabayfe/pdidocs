var NLUWorkbenchExportUtil = Class.create();

(function() {

    /*
    Exports the data from give table to sys_attachment in background:
    */
    NLUWorkbenchExportUtil.exportInBackground = function(table, filter, fields, execTable, execId, fileName) {
        var script = "global.NLUWorkbenchExportUtil.exportFromTable('" + table + "', '" + filter + "', '" + JSON.stringify(fields) + "', '" + execTable + "', '" + execId + "', '" + fileName + "');";
        return global.NLUWorkbenchGlobalScript.scheduleScript(script, execTable, execId);
    };

    /*
    Ex1 :
    -----
    NLUWorkbenchExportUtil.exportFromTable('sys_nlu_model');

    Ex 2:
    -----
    // * For the key: 'value', we can pass script as string and we can use varirables gr & field
    // * For the key: 'valueCb', it we can pass a callback function (this is not supported in schedule, as we convert json to string)
    var fields = {
        language: {
            label: 'Model Language',
            value: "'>' + gr.getValue(field) + '<'"
        },
        sys_id: {
            label: 'ID',
        },
        display_name: {
            label: 'Model Name',
            valueCb: function(gr, field) {
                return 'NLUModel: ' + gr.getValue(field)
            }
        }
    };
    NLUWorkbenchExportUtil.exportFromTable('sys_nlu_model', 'language=en', fields);
    */
    NLUWorkbenchExportUtil.exportFromTable = function(table, filter, fields, attachTable, attachId, fileName) {
        var exportUtil = new NLUWorkbenchExportUtil(table, filter, fields);
        exportUtil.setOptions({
            attachTable: attachTable,
            attachId: attachId,
            fileName: fileName
        });
        return exportUtil.exportData();
    };

    /*
    [Only from REST API] you can directly write to output stream

    Ex:
    ---
    NLUWorkbenchExportUtil.streamFromTable('sys_nlu_model', null, null, response.getStreamWriter());
    */
    NLUWorkbenchExportUtil.streamFromTable = function(table, filter, fields, writer) {
        var exportUtil = new NLUWorkbenchExportUtil(table, filter, fields);
        exportUtil.setOptions({
            writer: writer
        });
        return exportUtil.exportData();
    };

    var MODES = {
        SCHEDULE: 1,
        STREAM: 2
    };

    var splitFieldSeperator = ',';

    var tables = NLUWorkbenchConstants.tables;

    var escapeFormulas = gs.getProperty(NLUWorkbenchConstants.sysProps.EXPORT_ESCAPE_FORMULAS, false);
    var FORMULA_CHARACTERS = ['=', '+', '-', '@'];
    var ESCAPE_CHARACTER = '\'';

    NLUWorkbenchExportUtil.prototype = {

        initialize: function(table, filter, fieldDef) {
            this.table = table;
            this.filter = filter;
            this.fieldDef = fieldDef;
            this.fileName = table + '.csv';
            this.evaluator = new NLUScopedEvaluator();
        },

        setOptions: function(options) {
            if (!options) return;
            if (options.execTable && options.execId) {
                this.mode = MODES.SCHEDULE;
                this.attachTable = options.execTable;
                this.attachId = options.execId;
                if (options.fileName)
                    this.fileName = options.fileName;
                this.csvData = '';
            } else if (options.writer) {
                this.mode = MODES.STREAM;
                this.writer = options.writer;
            }
        },

        exportData: function() {
            this._prepareFieldsDef();
            this._addHeaders();
            this._addData();
            return this._endExport();
        },

        _prepareFieldsDef: function() {
            if (!this.fieldDef) {
                this.fieldDef = {};
                // TODO: As GlideTableDescriptor can not be used in scoped app, using sys_dictionary
                var dictGr = new GlideRecord(tables.SYS_DICTIONARY);
                dictGr.addQuery('name', this.table);
                dictGr.addEncodedQuery('internal_type!=collection^ORinternal_type=NULL'); // Ignore system fields
                dictGr.query();
                while (dictGr.next()) {
                    this.fieldDef[dictGr.element.toString()] = {
                        label: dictGr.column_label.toString()
                    };
                }
            } else if ('string' === typeof this.fieldDef) {
                // From ScheduleOnce, we get this fields as string, so convert back to object
                this.fieldDef = JSON.parse(this.fieldDef);
            }
        },

        _addHeaders: function() {
            var headerData = [];
            for (var eachField in this.fieldDef) {
                headerData.push(this.fieldDef[eachField].label);
            }
            this._processAndAddLines(headerData);
        },

        _addData: function() {
            // Add values:
            var gr = new GlideRecord(this.table);
            gr.addActiveQuery();
            if (this.filter) gr.addEncodedQuery(this.filter);
            gr.query();
            while (gr.next()) {
                this._addRecord(gr);
            }
        },

        _addRecord: function(gr) {
            var recordData = [];
            var numLines = 1; // Max values a split field can have
            for (var field in this.fieldDef) {
                var value = '';
                var splitField = this.fieldDef[field].splitField;
                if (this.fieldDef[field].valueCb) {
                    value = this.fieldDef[field].valueCb(gr, field);
                } else if (this.fieldDef[field].value) {
                    var params = {
                        gr: gr,
                        field: field
                    };
                    value = this.evaluator.evaluate(this.fieldDef[field].value, params);
                } else {
                    value = gr.getDisplayValue(field);
                }
                if (splitField && value.indexOf(splitFieldSeperator) !== -1) {
                    value = value.split(splitFieldSeperator);
                    if (value.length > numLines)
                        numLines = value.length;
                } else
                    value = value.toString();
                recordData.push(value);
            }
            this._processAndAddLines(recordData, numLines);
        },

        /*
        - data is an array of strings or arrays
        - numLines is the total number of lines we want to create from this data
        Ex data for 2 lines:
        [
            "Laptop heating up",
            "correct",
            "hardwareissues, laptopissues",
            [
                "hardwareissues",
                "laptopissues"
            ],
            [
                "78%",
                "82%"
            ]
        ]
        */
        _processAndAddLines: function(data, numLines) {
            numLines = numLines || 1;
            var linesArray = [];
            var firstField = true;
            var j = 0;
            for (var i = 0; i < data.length; i++) {
                var eachValue = value = data[i];
                for (j = 0; j < numLines; j++) {
                    if (j >= linesArray.length) linesArray.push('');
                    if (Array.isArray(value))
                        eachValue = (j < value.length) ? value[j] : '--';
                    linesArray[j] += (firstField ? '"' : ',"') + this._cleanseValue(eachValue) + '"';
                }
                firstField = false;
            }

            for (j = 0; j < numLines; j++)
                this._addLine(linesArray[j]);
        },

        _cleanseValue: function(value) {
            if (!value) return '';
            if (value !== '--') {
                value = value.trim().replaceAll('"', "\"\"");
                if (escapeFormulas && FORMULA_CHARACTERS.indexOf(value.charAt(0)) !== -1) {
                    value = ESCAPE_CHARACTER + value;
                }
            }
            return value;
        },

        _addLine: function(data) {
            data = data ? data + "\r\n" : '';
            if (this.mode === MODES.SCHEDULE) {
                this.csvData += data;
            } else {
                this.writer.writeString(data);
            }
        },

        _endExport: function() {
            if (this.mode === MODES.SCHEDULE) {
                // attach the file to a record.
                if (this.attachTable && this.attachId) {
                    var grRec = new GlideRecord(this.attachTable);
                    if (grRec.get(this.attachId)) {
                        var grAttachment = new GlideSysAttachment();
                        return grAttachment.write(grRec, this.fileName, 'application/csv', this.csvData);
                    }
                }
                return this.csvData;
            }
        },

        type: 'NLUWorkbenchExportUtil'
    };

})();
