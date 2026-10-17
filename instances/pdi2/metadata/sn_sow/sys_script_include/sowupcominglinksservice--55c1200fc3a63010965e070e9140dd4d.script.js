var SOWUpcomingLinksService = Class.create();
SOWUpcomingLinksService.prototype = {
    type: 'SOWUpcomingLinksService',
    initialize: function() {},
    _getDate: function(input, defaultValue) {
        var out = defaultValue;
        try {
            if ('function' == typeof gs[input]) {
                out = gs[input]();
            } else {
                out = new GlideDateTime(input);
            }
        } catch (e1) {
            try {
                out = new GlideDateTime(input);
            } catch (e2) {}
        }
        return out;
    },
    getAssginToQuery: function() {
        var user = gs.getUserID();
        var assginToQuery = "assigned_to=" + user;
        var gr = new GlideRecordSecure("sys_user_delegate");
        gr.addQuery("delegate", user);
        gr.addQuery("assignments", "true");
        gr.addQuery("starts", "<=", gs.daysAgo(0));
        gr.addQuery("ends", ">=", gs.daysAgo(0));
        gr.query();
        while (gr.next()) {
            assginToQuery = assginToQuery + "^ORassigned_to=" + gr.user;
        }
        return assginToQuery;
    },
    process: function(request) {
        if (gs.nil(request)) {
            throw gs.getMessage("Missing required parameter: request");
        }
        var fromDateTime = this._getDate(request.from, null);
        var toDateTime = this._getDate(request.to, null);
        if (gs.nil(fromDateTime)) {
            throw gs.getMessage("Missing/Invalid request parameter: from");
        }
        if (gs.nil(toDateTime)) {
            throw gs.getMessage("Missing/Invalid request parameter: to");
        }
        var response = {};
        var errors = {};
        var status = {};
        var items = [];
        var count = -1; // No extensions processed
        var extensions = new GlideScriptedExtensionPoint().getExtensions("sn_sow.UpcomingLinkProvider");
        if (extensions.length > 0) {
            count = 0;
            var assginToQuery = this.getAssginToQuery();
            for (var i = 0; i < extensions.length; i++) {
                var extension = extensions[i];
                var extensionStatus = {};
                var extensionId = extension.type;
                status[extensionId] = extensionStatus;
                var startTime = Date.now();
                try {
                    var subItems = extension.process(request, fromDateTime, toDateTime, assginToQuery);
                    for (var j = 0; j < subItems.length; j++) {
                        count++;
                        items.push(subItems[j]);
                    }
                } catch (e) {
                    try {
                        extensionStatus.error = JSON.stringify(e);
                    } catch (e) {
                        extensionStatus.error = "Unknown error";
                    }
                }
                var executionTime = Date.now() - startTime;
                extensionStatus.runtime = executionTime;
            }
        }
        response.from = fromDateTime;
        response.to = toDateTime;
        response.count = count;
        response.links = items;
        response.providers = status;
        return response;
    }
};
