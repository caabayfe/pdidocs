(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          // Add your code here
          var message_ids_list = current.messages.split(",");
          var all_messages_gr = new GlideRecord('sys_cs_message');
          all_messages_gr.addEncodedQuery("sys_id IN " + message_ids_list);
          all_messages_gr.orderBy('sys_created_on');
          all_messages_gr.query();

          while (all_messages_gr.next()) {
             template.print("<br/>");
             template.print(all_messages_gr.getDisplayValue("sys_created_on"));
             template.print("<br/>" + "\"");
             template.print(sn_cs.VASystemObject.getTextValueFromMessageDetails(all_messages_gr.getValue("payload"), all_messages_gr.getValue("message_type")));
             template.print("\"" + "<br/>");
          }
})(current, template, email, email_action, event);
