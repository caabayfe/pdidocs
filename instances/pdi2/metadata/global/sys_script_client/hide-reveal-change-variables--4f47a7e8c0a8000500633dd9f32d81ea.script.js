var g_cat_form = null;
function onLoad() {
  var cat = g_form.getValue('category');
  if (cat != 'Server Reboot' && cat != 'Database Restore' && cat != 'DNS Change')
     return;

  var map = gel('variable_map');
  var cat_form = new ServiceCatalogForm('ni', true, true);

  var items = map.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++) {
  	var item = items.item(i); 
	var name = item.getAttribute('qname');
	var id = item.id;
        var nm = new NameMapEntry(name, "ni.QS" + id);
        cat_form.addNameMapEntry(nm);
  } 
  
  var reason = cat_form.getControl('reason');
  if (!reason)
    return;

  var reason_detail = cat_form.getControl('reason_details');
  if (!reason_detail)
    return;

  g_cat_form = cat_form;
  setReasonVisibility(null, reason);
  var els = document.getElementsByName(reason.name);
  for (var i = 0; i < els.length; i++)
    els[i].onclick = setReasonVisibility.bindAsEventListener(els[i]);
 

}

function setReasonVisibility(e, target) {
   jslog('setReasonVisibility');
   if (!e)
      e = window.event;
	
   if (!target)    
      target = e.target ? e.target : e.srcElement;
   
   var vis = false;
   if (target.value == 'other')
     vis = true;
   
   g_cat_form.setDisplay('reason_details', vis);
}
