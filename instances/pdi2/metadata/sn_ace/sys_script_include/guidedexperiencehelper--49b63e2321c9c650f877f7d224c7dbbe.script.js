var GuidedExperienceHelper = Class.create();
GuidedExperienceHelper.prototype = {
    initialize: function() {},

    reset: function(contentBlockIds, key) {
        if (!contentBlockIds || !key) {
            return "content block id or key is missing";
        }
        var gr = this.queryContentBlockContext(contentBlockIds);

        while (gr.next()) {
            var contextPayload = gr.getValue('context_payload');
            contextPayload = JSON.parse(contextPayload);
            delete contextPayload[key];
            gr.context_payload = JSON.stringify(contextPayload);
            gr.update();
        }

    },
    //For app update older status will be there need to add key to that status.
    updateContextValueForExistingStatus: function(contentBlockIds, key) {
        if (!contentBlockIds || !key) {
            return "content block id or key is missing";
        }
        var gr = this.queryContentBlockContext(contentBlockIds);
        while (gr.next()) {
            var contextPayload = gr.getValue('context_payload');
            contextPayload = JSON.parse(contextPayload);
            contextPayload[key] = {'status':contextPayload.status};
            delete contextPayload['status'];
            gr.context_payload = JSON.stringify(contextPayload);
            gr.update();
        }
    },
    updateContextValue: function(contentBlockIds, key, status) {
        if (!contentBlockIds || !key || !status) {
            return "content block id or key or status is missing";
        }
        var gr = this.queryContentBlockContext(contentBlockIds);
        while (gr.next()) {
            var contextPayload = gr.getValue('context_payload');
            contextPayload = JSON.parse(contextPayload);
            contextPayload[key] =  {'status':status};
            gr.context_payload = JSON.stringify(contextPayload);
            gr.update();
        }

    },

    fetchContextValue: function(contentBlockIds, key) {
        var result = [];
        if (!contentBlockIds || !key) {
            return "content block id or key  is missing";
        }
        var gr = this.queryContentBlockContext(contentBlockIds);
        while (gr.next()) {
            var metaData = {};
            var contextPayload = gr.getValue('context_payload');
            contextPayload = JSON.parse(contextPayload);
            var status = contextPayload[key]
            metaData.content_block_id = gr.getValue('content_block_id')
            metaData.status = status;
            result.push(metaData);
        }

        return result;

    },
    // In case of adding new Guided experience item use the below code to update the status

    updateContentBlockStatus: function(contentBlockIds) {
        let isNewItem = false;
        for (var i = 0; i < contentBlockIds.length; i++) {
            var gr = new GlideRecord('sn_ace_content_block_context');
            if (gr.get('content_block_id', contentBlockIds[i])) {
                var contextPayload = gr.getValue('context_payload');
                contextPayload = JSON.parse(contextPayload);
                if (contextPayload['status'] == 'in_progress') {
                    this.resetGuidedExperienceContentBlock(i + 1, contentBlockIds);
					return;
                }
            } else {
                isNewItem = true;
                this.resetGuidedExperienceContentBlock(i, contentBlockIds, isNewItem);
				return;
            }

        }

    },
    queryContentBlockContext: function(contentBlockIds) {
        var gr = new GlideRecord('sn_ace_content_block_context');
        gr.addQuery('content_block_id', 'IN', contentBlockIds.join(","));
        gr.query();
        return gr;
    },
    resetGuidedExperienceContentBlock: function(index, cbIds, isNewItem) {
        for (var i = index; i < cbIds.length; i++) {
            var blockGR = new GlideRecord('sn_ace_content_block_context');
            if (blockGR.get('content_block_id', cbIds[i])) {
                blockGR.deleteMultiple();
            } else if (isNewItem) {
                isNewItem = false;
                blockGR.setValue('content_block_id', cbIds[i]);
                blockGR.setValue('context_payload', JSON.stringify({
                    "status": "in_progress"
                }));
                blockGR.insert();
            }
        }

    },


    type: 'GuidedExperienceHelper'
};
