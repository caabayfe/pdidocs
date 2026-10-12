var SKUMetadataSchemaDAO = Class.create();
SKUMetadataSchemaDAO.prototype = {
    initialize: function() {},

    fetchSKUMetadataColumnNames: function(skuMetaDataType) {

        const gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA_SCHEMA);
        gr.addQuery(LicensingEngineDBConstants.TYPE, skuMetaDataType);
        gr.query();
        if (gr.next())
            return gr.getValue(LicensingEngineDBConstants.COLUMN_NAMES);

        return "";
    },

    type: 'SKUMetadataSchemaDAO'
};
