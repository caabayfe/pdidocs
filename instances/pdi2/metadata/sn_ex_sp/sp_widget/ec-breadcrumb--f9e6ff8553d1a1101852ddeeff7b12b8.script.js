(function () {
  data.choice = options.navigation_method;
  data.widgetID = '';
  data.backButtonWidget = $sp.getWidget('hrm-back-button');
  data.breadcrumbsWidget = $sp.getWidget('breadcrumbs');
  data.breadcrumbs = [];

  if (input && input.event) {
    if (input.event == 'ec.breadcrumb.showback')
        data.widgetID = 'hrm-back-button';
    if (input.event == 'ec.breadcrumb.showbreadcrumb')
        data.widgetID = 'breadcrumbs';
    return;
  }

  if (data.choice === 'Breadcrumbs') {
    var topic = $sp.getParameter('topic_id');
    var kb_id = $sp.getParameter('sysparm_article');
    var kb_sys_id = "";
    if(gs.nil(kb_id)){
      kb_sys_id = $sp.getParameter('sys_id');
      if(gs.nil(kb_sys_id))
        kb_sys_id = $sp.getParameter('sys_kb_id');
      if(!gs.nil(kb_sys_id)){
        var kbGr = new GlideRecord('kb_knowledge');
        kbGr.get(kb_sys_id);
        if(kbGr.isValidRecord() && kbGr.canRead())
          kb_id = kbGr.getValue('number');
      }
    }
    if (topic) {
        data.breadcrumbs = new sn_ex_sp.TopicPageUtil().fetchBreadCrumbsForTopic(topic);
    }
    if(kb_id){
        data.breadcrumbs.push({label: kb_id, url: ''});
    }
    else{
        data.breadcrumbs = null;
    }
	
    data.widgetID = 'breadcrumbs';
  } else {
    data.widgetID = 'hrm-back-button';
  }
})();
