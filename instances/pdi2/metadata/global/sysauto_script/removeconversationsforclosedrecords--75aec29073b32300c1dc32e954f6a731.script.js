var currentEmailNotificationState = getEmailNotificationState();
		if (currentEmailNotificationState == 1) {
			updateEmailNotificationState(false);
			removeConversations();
			updateEmailNotificationState(true);
		} else
			removeConversations();

		function removeConversations() {
			var liveGroupMemberGR = new GlideRecord("live_group_member");
			var lgmCount = 0;
			liveGroupMemberGR.addQuery("state", "!=", "inactive");
			liveGroupMemberGR.query();
			while (liveGroupMemberGR.next()) {
				if (liveGroupMemberGR.group.document.active == false) {
					liveGroupMemberGR.state = "inactive";
					if (liveGroupMemberGR.update())
						lgmCount += 1;
				}
			}
			gs.debug("Number of live group members set to inactive" + lgmCount);
			var chatQueueEntryGR = new GlideRecord("chat_queue_entry");
			var chatsCount = 0;
			chatQueueEntryGR.addQuery("active", "true");
			chatQueueEntryGR.query();
			while (chatQueueEntryGR.next()) {
				if (chatQueueEntryGR.group.document.active == false) {
					chatQueueEntryGR.state = 3; //set chat_queue_entry state to closed_complete if parent document is inactive
					if (chatQueueEntryGR.update())
						chatsCount += 1;
				}
			}
			gs.debug("Number of chat queue entry records set to closed" + chatsCount);
		}

		function updateEmailNotificationState(activeState) {
			var gr = fetchEmailActionGr();
			if (!gr.next())
				return;
			gr.setWorkflow(false);
			gr.setValue("active", activeState);
			gr.update();
		}

		function getEmailNotificationState() {
			var gr = fetchEmailActionGr();
			if (!gr.next())
				return;
			return gr.getValue("active");
		}

		function fetchEmailActionGr() {
			var gr = new GlideRecord('sysevent_email_action');
			gr.addQuery("event_name", "collaboration.notify_offline_user.group");
			gr.query();
			return gr;
		}
