var PA = 'gs.include("PersonalizeAggregate");var v = new PersonalizeAggregate();';

function actionOK() {
  var sum = gel('ni.sum').checked;
  var min = gel('ni.min').checked;
  var max = gel('ni.max').checked;
  var avg = gel('ni.avg').checked;
  sum = sum?'true':'false';
  min = min?'true':'false';
  max = max?'true':'false';
  avg = avg?'true':'false';
  var ga = new GlideAjax('PersonalizeAggregateUpdate');
  ga.addParam('sysparm_name','update');
  ga.addParam('sysparm_sum_checked',sum);
  ga.addParam('sysparm_min_checked',min);
  ga.addParam('sysparm_max_checked',max);
  ga.addParam('sysparm_avg_checked',avg);
  ga.addParam('sysparm_list_view',g_list_view);
  ga.addParam('sysparm_list',g_list);
  ga.addParam('sysparm_list_element',g_list_element);
  ga.addParam('sysparm_list_parent',g_list_parent);
  ga.addParam('sysparm_list_relationship',g_list_relationship);
  ga.getXMLWait();

  var search = self.parent.location.href;
  if (search.indexOf("sysparm_refresh") == -1) {
	  var questionMark = '?';
	  var ampersand = '&';
	  var equalMark = '=';
	  
	  if (search.indexOf("nav_to.do") > -1) {
		 questionMark = '%3F'; 
		 ampersand = '%26';
		 equalMark = '%3D';
	 } 
     if (search.indexOf(questionMark) == -1)
        search += questionMark;
     else
        search += ampersand;
			
     search += 'sysparm_refresh' + equalMark + 'refresh';
  }
	
  setTimeout(function(){self.parent.window.location.href = search},5);
 
  return false;

}

function getAggregates() {
  var ga = new GlideAjax('PersonalizeAggregateUpdate');
  ga.addParam('sysparm_name','getAggregates');
  ga.addParam('sysparm_list_view',g_list_view);
  ga.addParam('sysparm_list_element',g_list_element);
  ga.addParam('sysparm_list_parent',g_list_parent);
  ga.addParam('sysparm_list_relationship',g_list_relationship);
  ga.addParam('sysparm_list',g_list);
  ga.getXML(listResponse);
}

function listResponse(request) {
  var xml = request.responseXML;

  z = xml.getElementsByTagName("element_attributes")[0];
  if (!z) {
     return;
  }

  var b = false;
  if (setElementFromAttribute('ni.sum', 'sum'))
     b = true;
  if (setElementFromAttribute('ni.max', 'max'))
     b = true;
  if (setElementFromAttribute('ni.min', 'min'))
     b = true;
  if (setElementFromAttribute('ni.avg', 'avg'))
     b = true;
  if (!b)
    gel('no_aggregates').style.display = '';
}

function setElementFromAttribute(eid, aid) {
  var e = gel(eid);
  var v = z.getAttribute(aid);
  if (v == 'not_allowed') {
     e.checked = false;
     return false;
  }

  e.checked = eval(v);
  gel(aid+"_tr").style.visibility = 'visible';
  return true;
}

  
addLoadEvent(function() {
  g_list = "$[sysparm_list]";
  g_list_view = "$[sysparm_list_view]";
  g_list_element = "$[sysparm_list_element]";
  g_list_parent = "$[sysparm_list_parent]";
  g_list_relationship = "$[sysparm_list_relationship]";
  gel('sum_tr').style.visibility = 'hidden';
  gel('min_tr').style.visibility = 'hidden';
  gel('max_tr').style.visibility = 'hidden';
  gel('avg_tr').style.visibility = 'hidden';
  getAggregates();
});
