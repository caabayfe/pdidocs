var messageHistoryGr = new GlideRecord('sys_gen_ai_message_history');
messageHistoryGr.query("mode!=aisearch");
messageHistoryGr.query();
messageHistoryGr.setValue("mode", "followup");
messageHistoryGr.updateMultiple();
