var DocumentExternalProviderUtils = Class.create();
DocumentExternalProviderUtils.prototype = {
    initialize: function() {
        this.constants = new global.DocumentExternalProviderConstantUtil();
    },
    getProviderDetails: function(providerDetailSysId) {
        if (providerDetailSysId) {
            var gr = new GlideRecordSecure(this.constants.tables.PROVIDER_DETAIL);
            if (gr.get(providerDetailSysId)) {
                var result = {};
                result['provider_name'] = gr.getValue("provider_name");
                result['attributes'] = gr.getValue("attributes");
                result['provider_detail_name'] = gr.getValue("provider_detail_name");
                result['provider_detail_sys_id'] = providerDetailSysId;
                return result;
            }
        }
    },

    /**
     * Validates the provider sys_id and returns provider GlideRecord.
     * @param {string} providerDetailSysId - Sys ID of the provider detail record.
     * @returns {Object} providerGR if valid.
     */
    validateProvider: function(providerDetailSysId) {
        if (!providerDetailSysId)
            throw this._createErrorResponse(this.constants.emptyProviderDetailSysIdMessage, this.constants.statusCode.BAD_REQUEST);

        var providerGR = new GlideRecordSecure(this.constants.tables.PROVIDER_DETAIL);
        if (!providerGR.get(providerDetailSysId))
            throw this._createErrorResponse("No Provider with Id " + providerDetailSysId + " exists", this.constants.statusCode.NOT_FOUND);

        if (providerDetailSysId === this.constants.UNSUPPORTED_PROVIDER_SYS_ID) {
            throw this._createErrorResponse(this.constants.unsupportedProviderSysIdMessage, this.constants.statusCode.BAD_REQUEST);
        }
        return providerGR;
    },

    /**
     * Custom error class that includes an HTTP status code
     * @param {String} message - Error message
     * @param {Number} statusCode - HTTP status code
     */
    _createErrorResponse: function(message, statusCode) {
        var err = new Error(message);
        err.status_code = statusCode;
        return err;
    },

    type: 'DocumentExternalProviderUtils'
};
