var ResponseTemplateSOW = Class.create();
ResponseTemplateSOW.prototype = {
    initialize: function() {
        this.CHANNEL_FORM = 'Form';
        this.CHANNEL_CHAT = 'Chat';
        this.CHANNEL_EMAIL = 'Email';
    },
    query: function(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts) {
        var eps = new GlideScriptedExtensionPoint().getExtensions("sn_templated_snip.response_template");
        for (var i = 0; i < eps.length; i++) {
            try {
                var ext = eps[i];
                if (ext.shouldRun(opts))
                    return ext.query(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat, opts);
            } catch (e) {
                gs.error("Unable to run query method.");
            }
        }

        var responseTemplate = new sn_templated_snippets.ResponseTemplate();
        if (gs.nil(opts.channel)) {
            // prepare to retrieve all templates with at least one channel
            responseTemplate.setChannel(null);
        } else {
            // prepare to retieve templates associated with a particular channel
            responseTemplate.setChannel(opts.channel);
        }
        return responseTemplate.query(tableName, recordId, searchTerm, limit, offset, includeEvaluatedBody, errorFormat);
    },
    type: 'ResponseTemplateSOW'
};
