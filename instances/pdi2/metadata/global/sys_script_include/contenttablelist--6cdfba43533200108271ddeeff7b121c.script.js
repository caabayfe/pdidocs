var ContentTableList = Class.create();
ContentTableList.prototype = {
    initialize: function () {
    },
    process: function () {
        var contents = TaxonomyConstants.TABLES.CONTENT_TABLES;
        return contents;
    },
    type: 'ContentTableList'
};
