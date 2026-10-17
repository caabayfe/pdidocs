(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          template.print(gs.getUserNameByUserID(current.getValue("sys_updated_by")));

})(current, template, email, email_action, event);
