var UXADatatableCountTransformer = Class.create();
UXADatatableCountTransformer.prototype = {
    initialize: function() {},

    transform: function(response, uxaDTO) {
        //{"result":[{"count":"155"}]}
        let count = 0;
        const resRows = response.rows;
        if (resRows) {
            resRows.forEach(row => {
                count = row[0];
            });
        }
        return [{
            count: count
        }];
    },
    type: 'UXADatatableCountTransformer'
};
