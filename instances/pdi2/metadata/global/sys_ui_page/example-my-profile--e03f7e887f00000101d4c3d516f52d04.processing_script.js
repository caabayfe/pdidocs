gs.addInfoMessage(gs.getMessage("processed"));
// go through each input prefeference and save the notification_disables 
var u = gs.getUser(); 
var m = request.getParameterMap(); 
var it = m.keySet().iterator(); 
while (it.hasNext()) { 
  var k = it.next(); 
  if (k.indexOf('notification_disable') != 0) 
    continue; 
  var o = m.get(k); 
  o = o[0]; 
  if ('true' == o) 
    u.setPreference(k, o); 
  else 
    u.deletePreference(k); 
}
