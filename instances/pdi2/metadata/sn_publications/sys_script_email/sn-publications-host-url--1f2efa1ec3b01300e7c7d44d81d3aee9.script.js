(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

         template.print(gs.getProperty('glide.servlet.uri'));

})(current, template, email, email_action, event);
