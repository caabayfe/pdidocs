var CMDBWsDataBrokerHandler = Class.create();
CMDBWsDataBrokerHandler.prototype = {
    initialize: function () {},

    /**
     * This executes any function passed as input and handles the error in generic way
     */
    execute: function (source, action, fn) {
        if (typeof fn === "function") {
            try {
                var args = Array.prototype.slice.call(arguments, 3);
                return fn.apply(this, args);
            } catch (e) {
                var error = e;
                if (!(error instanceof CMDBWsError)) {
                    error = new CMDBWsError({
                        source: source || 'sn_cmdb_ws',
						action: action,
                        details: e.message,
                        logError: true,
                        originalError: e
                    });
                }

                throw JSON.stringify(error);
            }
        }
    },

    type: 'CMDBWsDataBrokerHandler'
};
