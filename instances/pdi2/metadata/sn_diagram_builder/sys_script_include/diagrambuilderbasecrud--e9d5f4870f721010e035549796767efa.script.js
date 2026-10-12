var DiagramBuilderBaseCRUD = Class.create();
DiagramBuilderBaseCRUD.prototype = {
    initialize: function() {},

    table: null,

    /*
     * createWithTemplate: 
     *   - creates a record with given attributes in payload and a given template record
     * @param {Object} payload - payload with attributes for new record
     * @param {GlideTemplate} template - template to apply on new record
     * @returns {GlideRecord} new glide record.
     */
    createWithTemplate: function(payload, template) {

        var newRecordId;
        var gr = new GlideRecord(this.table);
        gr.initialize();
        if (gs.nil(template))
            gr.initialize();
        else
            template.apply(gr);
        //iterate and assign payload attribute to GlideRecord
        var elementType;
        for (var key in payload) {
            elementType = gr.getElement(key).getED().getInternalType();
            if (elementType == 'currency2')
                gr.getElement(key).setDisplayValue(payload[key]);
            else if (elementType === 'journal_input')
                gr[key] = payload[key];
            else
                gr.setValue(key, payload[key]);
        }
        newRecordId = gr.insert();
        //if create fails return null
        if (gs.nil(newRecordId)) {
            var payloadStr = JSON.stringify(payload);
            gs.error('Failed to create data from payload: ' + payloadStr);
            return null;
        }
        return gr;
    },

    /*
     * create: 
     *   - creates a record with given attributes in payload
     * @param {Object} payload - payload with attributes for new record
     * @returns {GlideRecord} new glide record.
     */
    create: function(payload) {
        return this.createWithTemplate(payload, null);
    },

    /**
     * getById: 
     *   - Fetch record using sys_id
     * @param {Sys ID} sysId - sys id of the record
     * @returns {GlideRecord}
     */
    getById: function(sysId) {
        var gr = new GlideRecord(this.table);
        gr.get(sysId);
        return gr;
    },

    /**
     * getByQuery: 
     *   - Fetch record(s) for the given encoded
     *     query string or sys_id.
     * @param {string} encodedQuery - encoded query string
     * @returns {GlideRecord}
     */
    getByQuery: function(encodedQuery, chooseWindowObj, setLimitRange) {
        var gr = new GlideRecord(this.table);

        if (!gs.nil(encodedQuery)) { // if query passed
            gr.addEncodedQuery(encodedQuery, false);

            if (!gs.nil(setLimitRange) && (!isNaN(setLimitRange)))
                gr.setLimit(setLimitRange + '');

            if (!gs.nil(chooseWindowObj) && !gs.nil(chooseWindowObj.start) && !gs.nil(chooseWindowObj.end))
                gr.chooseWindow(chooseWindowObj.start, chooseWindowObj.end);
            gr.query();
        } else { //otherwise fail
            gs.error('Failed to get data from table.' + this.table);
            return null;
        }
        return gr;
    },

    /**
     * deleteRecord: 
     *   - delete record identified by object.
     * @param {GlideRecord|GlideRecordSecure} record - glide record(GR/GRS) of the record
     * @returns {boolean} true if delete is successful or false when delete operation fails.
     */
    deleteRecord: function(record) {
        var status,
            gr;
        //get record
        if (record instanceof GlideRecord || record instanceof GlideRecordSecure) { // if record passed
            gr = record;
        } else if (!gs.nil(record)) { 
            gr = this.get(null, record);
        } else { //otherwise fail
            gs.error('Failed to delete record from table.' + this.table);
            return null;
        }

        //record found
        if (gr.isValidRecord()) {
            status = gr.deleteRecord();
        } else { //Invalid record
            gs.error('Failed to delete record from table.' + this.table);
            return null;
        }
        //if delete fails log
        if (!status) {
            gs.error('Failed to delete record from table.' + this.table);
        }

        return status;
    },


    type: 'DiagramBuilderBaseCRUD'
};
