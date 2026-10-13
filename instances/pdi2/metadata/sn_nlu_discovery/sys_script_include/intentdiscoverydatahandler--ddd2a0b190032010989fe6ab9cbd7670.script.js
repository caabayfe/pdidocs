var IntentDiscoveryDataHandler = Class.create();
IntentDiscoveryDataHandler.prototype = {
    initialize: function() {},
    // returns random sample of records of a classafied Intent
    fetchOriginalRecords: function(intentSysId, numberOfRecordsToReturn) {
        var gr = new GlideRecord("sn_nlu_discovery_processed_message");
        gr.addQuery("intent", intentSysId);
        gr.query();
        var total_n = gr.getRowCount();

        if (numberOfRecordsToReturn > total_n) {
            numberOfRecordsToReturn = total_n;
        }
        // create indexes for lookup
        var index = [];
        for (var i = 0; i < total_n; i++) {
            index[i] = i;
        }

        // Shuffle indexes.
        for (var j = index.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var temp = index[j];
            index[j] = index[k];
            index[k] = temp;
        }

        // slice array to return number of records requested.
        if (index.length > numberOfRecordsToReturn) {
            index = index.slice(0, numberOfRecordsToReturn);
        }

        var records = [];
        for (var i = 0; i < index.length; i++) {
            row = index[i];
            gr.chooseWindow(row, row + 1);
            gr.query();
            if (gr.next()) {
                records.push(gr.getValue("record_id"));
            }
        }
        return records;
    },
    type: 'IntentDiscoveryDataHandler'
};
