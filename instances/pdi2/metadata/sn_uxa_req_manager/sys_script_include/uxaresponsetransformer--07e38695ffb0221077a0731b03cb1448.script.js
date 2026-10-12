var UXAResponseTransformer = Class.create();
UXAResponseTransformer.prototype = {
    initialize: function() {},

    //Response structure
    /*
    {"columns":[{"key":"NAME","type":"link","label":"Name"},{"key":"VIEWS","type":"number","headerCellAlignment":"inverse","format":"number","label":"Views","sortDirection":"descending"}],"rows":[{"NAME":{"value":"name1","key":"name1","old_value":"name1"},"VIEWS":{"value":"2.00","key":2}},{"NAME":{"value":"nam2","key":"nam2","old_value":"nam2"},"VIEWS":{"value":"1.00","key":1}}]}
    */
    transform: function(response) {

        //Get all columns keys that needs to ne used as key in the row object of response
        const columnKeys = response.columns.map(col => col.key);

        const transformedData = response.rows.map(row => {
            const transformedRow = {};
            columnKeys.forEach(key => {
                const cell = row[key];
                const updatedKey = UXAConstants.RESPONSE_TRANSFORMER_COLUMN_KEY_MAP[key] || key;
                //User column key as JSON object key
                if (cell && cell.hasOwnProperty("key")) {
                    //set the value to transformed row key
                    transformedRow[updatedKey] = cell.value;
                } else {
                    transformedRow[updatedKey] = null;
                }
            });
            return transformedRow;
        });

        return {
            data: transformedData
        };
    },

    type: 'UXAResponseTransformer'
};
