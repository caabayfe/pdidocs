var NLUExportUtil = Class.create();

(function() {

    /*
    Exports the data from give table to sys_attachment in background:
    */
    NLUExportUtil.exportInBackground = function(table, fileName, filter, fields, execTable, execId) {
        var script = "global.NLUExportUtil.exportFromTable('" + table + "', '" + fileName + "', '" + filter + "', '" + JSON.stringify(fields) + "', '" + execTable + "', '" + execId + "');";
        return global.NLUWorkbenchGlobalScript.scheduleScript(script, execTable, execId);
    };

    /*
    Ex1 :
	-----
	NLUExportUtil.exportFromTable('sys_nlu_model');
	
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
	NLUExportUtil.exportFromTable('sys_nlu_model', 'myFileName.csv', 'language=en', fields);
    */
    NLUExportUtil.exportFromTable = function(table, fileName, filter, fields, attachTable, attachId) {
        if (!fields) {
            fields = {};
            var nluModelDesc = new GlideTableDescriptor(table);
            var nluModelElems = nluModelDesc.getSchemaList();
            for (var i = 0; i < nluModelElems.size(); i++) {
                fields[nluModelElems.get(i).getName()] = {
                    label: nluModelElems.get(i).getLabel()
                };
            }
        } else if ('string' === typeof fields) {
            // From ScheduleOnce, we get this fields as string, so convert back to object
            fields = JSON.parse(fields);
        }
        if (!fileName)
            fileName = table + '.csv';

        // Add headers:
        var csvData = '';
        for (var eachField in fields) {
            csvData += (csvData ? ',"' : '"') + fields[eachField].label + '"';
        }
        csvData += csvData ? "\r\n" : '';

        // Add values:
        var gr = new GlideRecord(table);
        gr.addActiveQuery();
        if (filter) gr.addEncodedQuery(filter);
        gr.query();
        while (gr.next()) {
            if (!attachId) attachId = gr.getUniqueValue();
            var firstField = true;
            for (var field in fields) {
                var value = '';
                if (fields[field].valueCb) {
                    value = fields[field].valueCb(gr, field);
                } else if (fields[field].value) {
                    var params = new Packages.java.util.HashMap();
                    params.put('gr', gr);
                    params.put('field', field);
                    value = GlideEvaluator.evaluateStringWithGlobals(fields[field].value, params);
                } else {
                    value = gr.getDisplayValue(field);
                }
                csvData += (firstField ? '"' : ',"') + value + '"';
                firstField = false;
            }
            csvData = csvData + "\r\n";
        }

        // attach the file to a record.
        var grRec = new GlideRecord(attachTable || table);
        if (grRec.get(attachId)) {
            var grAttachment = new GlideSysAttachment();
            return grAttachment.write(grRec, fileName, 'application/csv', csvData);
        }
        return null;
    };

    NLUExportUtil.prototype = {
        initialize: function() {},

        type: 'NLUExportUtil'
    };

})();
