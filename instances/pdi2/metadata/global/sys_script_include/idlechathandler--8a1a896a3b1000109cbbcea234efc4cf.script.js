var IdleChatHandler = Class.create();
IdleChatHandler.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
	},

    process: function(idle_reminder_timeout, idle_cancel_timeout, start_timer_on_agent_message) {
        var conversations = {};
        // Get All conversations which are `chatInProgress` or'autoPilotInProgress' state, not messaging type and the client is online
        conversations = this.getAllConversations();
        if (start_timer_on_agent_message == "true") { //only get conversations that agent has responded to
            conversations = this.getConversationsAgentHasRespondedTo(conversations);
        }

        // Set Last Client Activity times for the conversations
        this.setLastClientActivityTimesBatched(conversations, start_timer_on_agent_message);

        // Idle Reminder Threshold based on `idle_reminder_timeout` (given in seconds)
        var idleReminderThreshold = new GlideDateTime().getNumericValue() - (idle_reminder_timeout * 1000); // In Millis
        // Idle Cancel Threshold based on `idle_cancel_timeout` (given in seconds)
        var idleCancelThreshold = new GlideDateTime().getNumericValue() - (idle_cancel_timeout * 1000); // In Millis

        var toBeCancelledConversations = [];
        var toBeRemindedConversations = [];
        var removeReminderConversations = [];

        for (var conversationId in conversations) {

			var chatDetails = sn_cs.VASystemObject.getLiveAgentChatDetails(conversationId);

			/*
			  Move on to next conversation when:
			    1- There was an exception with getLiveAgentChatDetails().
			    2- Live chat is not in progress.
			    3- Chat is being transferred from one agent to another live agent and not accepted yet.
			*/
            if (chatDetails == null || !chatDetails.is_live_chat_in_progress || chatDetails.is_agent_transfer_in_progress) {
                continue;
            }

			/*
              Updating the last activity time when live agent (during transfer) accepts the conversation.
              This way, the conversation won't time out immediately after the agent accepts the transfer request.
			*/
			var stateChangedOn = chatDetails.awa_work_item_state_changed_on;
			var lastActivityTime = new GlideDateTime(conversations[conversationId]).getNumericValue();//In Millis
			if (stateChangedOn > lastActivityTime) {
				lastActivityTime = stateChangedOn;
			}

            /*
               Client lastActivityTime is after the idleReminderThreshold

               CLIENT HAS BECOME ACTIVE AFTER REMINDER IS SENT
            */

            if (lastActivityTime >= idleReminderThreshold) {
                removeReminderConversations.push(conversationId);
                continue;
            }

            /*
            	 Client lastActivityTime is before the idleReminderThreshold
            	 Client lastActivityTime is after the idleCancelThreshold

            	 CLIENT NEEDS TO BE SENT A REMINDER THAT HE IS INACTIVE
            */

            if (lastActivityTime < idleReminderThreshold && lastActivityTime >= idleCancelThreshold) {
                toBeRemindedConversations.push(conversationId);
                continue;
            }

            /*
            	Client lastActivityTime is before the idleCancelThreshold

            	CLIENT HAS BEEN INACTIVE EVEN AFTER THE REMINDER IS SENT
            */

            if (lastActivityTime < idleCancelThreshold) {
                toBeCancelledConversations.push(conversationId);
            }
        }

        this.removeReminderConversations(removeReminderConversations);
        this.sendReminderConversations(toBeRemindedConversations);
        this.updateCancelledConversations(toBeCancelledConversations, true);

    },

    getAllConversations: function() {
        var conversations = {};
        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic.state", "IN", "chatInProgress,autoPilotInProgress");
        gr.addNullQuery("topic.conversation_completed");
        gr.addQuery("online", true);
        gr.query();
        while (gr.next()) {
            var convId = gr.getValue("topic");
            if (!this.isProcessable(convId))
                continue;

            conversations[convId] = gr.topic.getRefRecord().getValue('sys_updated_on');
        }
        return conversations;
    },

    getConversationsAgentHasRespondedTo: function(conversations) {
        var newConversations = {};

        gr = new GlideAggregate("sys_cs_message");
        gr.addQuery("conversation", "IN", Object.keys(conversations).join(","));
        gr.addQuery("direction", "outbound");
        gr.addQuery("is_agent", "true");
        gr.addQuery("message_type", "IN", ["Text", "Rich"]);
        gr.addNullQuery("visibility_type");
        gr.addAggregate("MAX", "sys_updated_on");
        gr.addAggregate("COUNT");
        gr.groupBy('conversation');
        gr.query();

        while (gr.next()) {
            if (gr.getAggregate("COUNT") > 1) {
                newConversations[gr.getValue("conversation")] = gr.getAggregate('MAX', 'sys_updated_on');
            }
        }
        return newConversations;
    },

    isProcessable: function(convId) {
        try {
            return (sn_cs.VASystemObject.getInteractionType(convId) == 'chat');
        } catch (err) {
            // log the exception with the conversation Id
            this.logger.error('IdleChatHandler exception getting interaction type for conversation ' + convId + ': ' + GlideLog.getStackTrace(err));
            //continue processing with next conversation
            return false;
        }
    },
    setLastClientActivityTimesBatched: function(conversations, start_timer_on_agent_message) {
        //updates the conversation in batches
        var batchSize = 100;
        var noOfConversations = Object.keys(conversations).length;
        for (var i = 0; i < noOfConversations; i += batchSize) {
            this.setLastClientActivityTimes(conversations, start_timer_on_agent_message, i, i + batchSize);
        }
    },
    // Consider only last `inbound` message
    setLastClientActivityTimes: function(conversations, start_timer_on_agent_message, startIndex, endIndex) {
        var conversationIds = Object.keys(conversations).slice(startIndex, endIndex);
        if (conversationIds.length > 0) {
            var gr = new GlideAggregate("sys_cs_message");
            gr.addQuery("conversation", "IN", conversationIds);
            var q1 = gr.addQuery("direction", "inbound");

            //checks for client activity only after the agent's first message
            if (start_timer_on_agent_message == "true") {
                q1.addOrCondition("direction", "outbound").addCondition("message_type", "IN", ["Text", "Rich"]).addCondition("is_agent", "true");
            } else {
                q1.addOrCondition("direction", "outbound").addCondition("payload", "CONTAINS", "SwitchToLiveAgent");
            }

            gr.addAggregate("MAX", "sys_updated_on");
            gr.groupBy('conversation');
            gr.query();
            while (gr.next()) {
                //make time starts based off agent response
                conversations[gr.getValue("conversation")] = gr.getAggregate('MAX', 'sys_updated_on');
            }
        }
    },

    // Client has become active, No need to send reminder, mark the client 'online'
    removeReminderConversations: function(conversations) {
        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic", "IN", conversations);
        gr.setValue('sent_reminder', false);
        gr.setValue('online', true);
        gr.updateMultiple();
    },

    // Client has been inactive, Send a reminder
    sendReminderConversations: function(conversations) {
        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic", "IN", conversations);
        gr.setValue('sent_reminder', true);
        gr.updateMultiple();
    },

    // Client has been inactive since long even though the reminder is send
    // Cancel the conversation and mark the client offline
    // checkReminder is a boolean indicating we will ensure the
    // sent_reminder flag is true before we cancel
    updateCancelledConversations: function(conversations, checkReminder) {
        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic", "IN", conversations);
        if (checkReminder) {
            // method invoked from cancel timeout, check for remainder flag and send reminder if not sent
            this.sendReminderForToBeCancelledConversations(conversations);
            gr.addQuery('sent_reminder', true);
        }
        gr.setValue('online', false);
        gr.updateMultiple();
    },

    //Send Reminder for Conversations to be cancelled due to time out but never got reminder message
    sendReminderForToBeCancelledConversations: function(conversations) {
        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic", "IN", conversations);
        gr.addQuery('sent_reminder', false);
        gr.setValue('sent_reminder', true);
        gr.updateMultiple();
    },

    //Look for session bindings that have the client_connected set to false
    //if they haven't been updated in a given amount of time, cancel the conversation
    processDisconnectedSessions: function(disconnect_timeout) {
        var disconnectedThreshold = new GlideDateTime();
        // subtract the timeout value from current date/time to get threshold
        // look for anything disconnected before that date/time
        disconnectedThreshold.addSeconds(-1 * disconnect_timeout);

        var gr = new GlideRecord("sys_cs_session_binding");
        gr.addQuery("topic.state", "IN", "chatInProgress,autoPilotInProgress");
        gr.addNullQuery("topic.conversation_completed");
        gr.addQuery("topic.device_type", "!=", "adapter");
        gr.addQuery("online", true);
        gr.addQuery("client_connected", false);
        gr.addQuery("sys_updated_on", "<", disconnectedThreshold.getValue());
		gr.setLimit(100);
        gr.query();

        var toBeCancelledConversations = [];

        while (gr.next()) {
            toBeCancelledConversations.push(gr.getValue("topic"));
        }

        this.updateCancelledConversations(toBeCancelledConversations, false);
    },

    type: 'IdleChatHandler'
};
