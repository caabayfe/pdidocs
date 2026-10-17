(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    template.print('<b>' + JSON.parse(event.parm1).daysRemaining + '</b>');

})(current, template, email, email_action, event);
