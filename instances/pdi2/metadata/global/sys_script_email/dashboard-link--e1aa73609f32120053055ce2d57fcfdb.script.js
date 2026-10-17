(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          var link = gs.getProperty('glide.servlet.uri') + "$dashboards.do?sysparm_dashboard=" + current.sys_id;
          var anchor = "<a href='" + link +"'>" + "View dashboard" + "</a>";
          template.print(anchor + "<br />");

})(current, template, email, email_action, event);
