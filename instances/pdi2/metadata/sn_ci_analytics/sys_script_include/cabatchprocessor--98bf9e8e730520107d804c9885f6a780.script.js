var CABatchProcessor = Class.create();
CABatchProcessor.batchId = gs.generateGUID();
CABatchProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger("CABatchProcessor");
        this.config = new CAConfig();
        this.sender = new CASender();
        this.payloadSizeCalculator = new CAPayloadSizeCalculator();
        this.minBatchSize = this.config.getBatchSize();
        this.maxBatchSize = this.config.getMaxBatchSize();
        this.maxReasonLength = this.config.getReasonMaxLength();
        this.conversationsSize = 0;
        this.conversationIds = [];
        this.conversations = [];
    },

    /**
     * Sends the all queued conversations.
     * @returns {Boolean} return true if error occured
     */
    sendAll: function() {
        this._sendAndUpdateStatus();
    },

    /**
     * Sends the conversation Or Queued the conversation till max batch size reached. 
     * @param {Object} conversation - ETL processed conversation object
     * @returns {Boolean} return true if error occured
     */
    queueOrSend: function(conversation) {
        var success = true;
        var currentConversationSize = this._getSizeInKB(conversation);
        if (!this._validateSize(currentConversationSize, conversation))
            return success;
        var totalSize = currentConversationSize + this.conversationsSize;
        if (totalSize >= this.minBatchSize) {
            if (totalSize <= this.maxBatchSize) {
                this._addConversation(conversation);
                success = this._sendAndUpdateStatus();
            } else {
                success = this._sendAndUpdateStatus();
                this._addConversation(conversation);
                this.conversationsSize = currentConversationSize;
            }
        } else {
            this._addConversation(conversation);
            this.conversationsSize = totalSize;
        }
        return success;
    },

    _validateSize: function(size, conversation) {
        if (!size)
            return false;
        if (size > this.maxBatchSize) {
            var msg = "[Appsee Job]: Conversation: " + conversation.Id + "," +
                " BatchId: " + CABatchProcessor.batchId + ", " +
                " Conversation size " + size + " is graterthan than max size " + this.maxBatchSize + ".";
            this.logger.error(msg);
            this._updateTableWithStatus([conversation.Id], 'error', msg);
            return false;
        }
        return true;
    },

    _getSizeInKB: function(conversation) {
        var size;
        try {
            var json = new global.JSON().encode(conversation);
            var sizeInBytes = this.payloadSizeCalculator.checkSize(json);
            size = Number((sizeInBytes >>> 10) + '.' + (sizeInBytes & (0x3FF)));
            if (this.logger.isDebugEnabled()) {
                var data = [conversation.Id, CABatchProcessor.batchId, sizeInBytes, size, json];
                this.logger.debug('Conversation:{0}, BatchId:{1},\n Size: {2}bytes,\n Size: {3}KB,\n JSON:{4}', data);
            }
        } catch (err) {
            if (err.message == 'String object has exceeded maximum permitted size of 33554432') {
                var params = [conversation.Id, CABatchProcessor.batchId, err, err.stack];
                this.logger.error('An exception occurred while converting to a JSON or calculating JSON Conversation:{0}, BatchId:{1}, error: {2},\n stackTrace: {3}', params);
                this._updateTableWithStatus([conversation.Id], 'error', '[Appsee Job]: ' + err.message);
            } else
                throw err;
        }
        return size;
    },

    _addConversation: function(conversation) {
        this.conversationIds.push(conversation.Id);
        this.conversations.push(conversation);
        this.logger.info("ConversationId: {0} added to BatchId:{1}", [conversation.Id, CABatchProcessor.batchId]);
    },

    _sendAndUpdateStatus: function() {
        var success = true;
        if (this.conversationIds.length == 0)
            return success;

        var params = [CABatchProcessor.batchId, this.conversationIds.length, this.conversationsSize];
        this.logger.info("BatchId:{0}, Sending {1} Conversations, Size: {2}KB", params);
        var response = JSON.parse(this._sendAppsee());
        success = response.Status == 'OK' ? true : false;
        var errors = response.Errors;
        if (success && errors) {
            var _this = this;
            this.logger.info("BatchId: {0}, Conversations with Errors: {1} ", [CABatchProcessor.batchId, JSON.stringify(errors)]);
            errors.forEach(function(error) {
                var conversationId = error.SessionId;
                var reason = error.Error;
                var trimmedReason;
                if (reason)
                    trimmedReason = '[Appsee Job]: ' + reason.substring(0, _this.maxReasonLength);

                _this.conversationIds.splice(_this.conversationIds.indexOf(conversationId), 1);
                _this._updateTableWithStatus([conversationId], 'error', trimmedReason);
                var params = [CABatchProcessor.batchId, conversationId, reason];
                _this.logger.error("BatchId:{0}, Appsee not able to process the {1} Conversation due to reason {2}", params);
            });
        }

        if (success) {
            this._updateTableWithStatus(this.conversationIds, 'processed');
            this.logger.info("BatchId: {0}, Conversations processed {1}", [CABatchProcessor.batchId, JSON.stringify(this.conversationIds)]);
            this._reset();
        } else {
            this.logger.info("BatchId: {0}, Conversations posting failed {1}", [CABatchProcessor.batchId, JSON.stringify(this.conversationIds)]);
        }
        return success;
    },

    _sendAppsee: function() {
        return this.sender.send(this.conversations);
    },

    _updateTableWithStatus: function(conversationIds, status, reason) {
        var record = new GlideRecord('sn_ci_analytics_conversation');
        record.addQuery("conversation", "IN", conversationIds);
        record.query();
        if (reason) {
            while (record.next()) {
                var reasonValue = record.getValue('reason');
                reasonValue = gs.nil(reasonValue) ? reason : reasonValue + '\n' + reason;
                record.setValue('batch_id', CABatchProcessor.batchId);
                record.setValue('appsee_status', status);
                record.setValue('reason', reasonValue);
                record.setValue('sys_updated_on', new GlideDateTime().getValue());
                record.update();
            }
        } else {
            record.setValue('batch_id', CABatchProcessor.batchId);
            record.setValue('appsee_status', status);
            record.setValue('sys_updated_on', new GlideDateTime().getValue());
            record.updateMultiple();
        }
    },

    _reset: function() {
        this.conversationsSize = 0;
        this.conversationIds = [];
        this.conversations = [];
        CABatchProcessor.batchId = gs.generateGUID();
    },

    type: 'CABatchProcessor'
};
