Event.observe(window, "load", function() {
     onLoad();
 });
 
function onLoad() {
  moveOutMessageDivToPos1();
  disableBreadcrumbFilterLinks();
}

//a output_messages div added on top of nav bar by default.Take the
//content and add to one below navbar on page load.
function moveOutMessageDivToPos1() {
  if($$("#output_messages")) {
    if($$("#output_messages").length == 2) {
      $$("#output_messages")[1].replace($$("#output_messages")[0]);
    }
  }
}

 function disableBreadcrumbFilterLinks() {
     $$('.list_filter_toggle')[0].removeAttribute('class');
     $$(".breadcrumb_link:contains('All')")[0].removeAttribute('class');
 }

 function back() {
     var url = new GlideURL('import_template_upload.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     window.location = url.getURL();
 }

 function showAllRows() {
     var url = new GlideURL('import_template_preview.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     url.addParam('sysparm_process_stage', 'transform');
     url.addParam('sysparm_import_set_id', '$[sysparm_import_set_id]');
     url.addParam('sysparm_list_query', buildListQuery(false));
     url.addParam('sysparm_list_view', "all");
     url.addParam('sysparm_template_type', '$[sysparm_template_type]');
     window.location = url.getURL();
 }

 function showErrorRows() {
     var url = new GlideURL('import_template_preview.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     url.addParam('sysparm_process_stage', 'transform');
     url.addParam('sysparm_import_set_id', '$[sysparm_import_set_id]');
     url.addParam('sysparm_list_query', buildListQuery(true));
     url.addParam('sysparm_list_view', "errors");
     url.addParam('sysparm_template_type', '$[sysparm_template_type]');
     window.location = url.getURL();
 }

 function buildListQuery(isErrorQuery) {
     var query = "sys_import_set=" + '$[sysparm_import_set_id]';
     if (isErrorQuery)
         query += "^template_import_logISNOTEMPTY";
     query += "^ORDERBYsys_import_row";
     return query;
 }

 function loadingText(show) {
     var b = gel('import_button');
     var t = gel('loading');
     if (show) {
         b.style.display = "none";
         t.style.display = "";
     } else {
         b.style.display = "";
         t.style.display = "none";
     }
 }
