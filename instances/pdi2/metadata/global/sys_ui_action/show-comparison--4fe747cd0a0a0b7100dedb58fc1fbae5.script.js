function showComparison() { 
    if (typeof rowSysId == 'undefined')
       sysId = gel('sys_uniqueValue').value;
    else
       sysId = rowSysId;

   var ga = new GlideAjax("DiffAjax");
   ga.addParam("sysparm_name", "diffUpdateSetPreview");
   ga.addParam("sysparm_sys_id",sysId);
   ga.getXMLAnswer(createComparisonDialog);	
}
function createComparisonDialog(answer) {
   var div = new Element("div", {"style":"min-width:800px"}).update(answer);
   var wrapper = div.wrap(new Element("div"));
   var dialog = new GlideBox({
             body:wrapper.innerHTML, 
             title:"Conflict Comparison",
             height: "95%",
             width: "95%",
             autoDimensionOnLoad: 'false'
   });
   dialog.render();
}
