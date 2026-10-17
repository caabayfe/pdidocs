var UpcomingLinkProvider = Class.create();
UpcomingLinkProvider.prototype = {
    type: 'UpcomingLinkProvider',
    initialize: function() {},
    process: function(request, fromDateTime, toDateTime, assginToQuery) {
        // Return array of objects per the link set api
        // https://developer.servicenow.com/dev.do#!/reference/now-experience/quebec/shared-components/now-link-set/api
        return null;
    }
};
