var AccountNowAssistPurchasedDao = Class.create();
AccountNowAssistPurchasedDao.prototype = {
    initialize: function() {
        this._tableName = LicensingEngineDBConstants.ACCOUNT_NOWASSIST_PURCHASED;
    },

    _getEarliestAssistEntStartDate: function() {
        const gr = new GlideRecord(this._tableName);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.NOW_ASSIST_STATUS_TO_CHECK);
        gr.orderBy(LicensingEngineDBConstants.START_DATE);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return new GlideDateTime(gr.getValue(LicensingEngineDBConstants.START_DATE));
        }

        return null;
    },

    type: 'AccountNowAssistPurchasedDao'
};
