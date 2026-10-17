var ga = new GlideAjax("DiffAjax");
ga.addParam("sysparm_name", "compareToPrevious");
ga.addParam("sysparm_sys_id","${sysparm_sys_id}");
ga.addParam("sysparm_table_name","${sysparm_table}"); 
ga.getXML(getPayloadDiff,null,null);

function getPayloadDiff(response, args) {
   var diff = response.responseXML.documentElement.getAttribute("answer");
   var diffDiv =  gel("diff");
   diffDiv.innerHTML = diff;
}


var ga = new GlideAjax("DiffAjax");
ga.addParam("sysparm_name","getURL");
ga.addParam("sysparm_sys_id", "${sysparm_sys_id}");
ga.addParam("sysparm_table_name", "${sysparm_table}");
ga.getXML(redirectURL,null,null);

function redirectURL(response, args) {
   var url = response.responseXML.documentElement.getAttribute("answer");
   var edit = gel("edit_button");
   edit.setAttribute("action",url);
}
