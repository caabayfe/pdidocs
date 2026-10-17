var OnCallNotifyUtilsImpl = Class.create();
OnCallNotifyUtilsImpl.prototype = {
    initialize: function() {},

    /**
     * @param number        String
     * @param getUserRecord Boolean
     * @returns {*}
     */
    getUserByNumber: function(number, getUserRecord, numberType) {
        return new global.OnCallContactPreferenceUtil().getUserFromContactSource(number, getUserRecord);
    },

    type: 'OnCallNotifyUtilsImpl'
};
