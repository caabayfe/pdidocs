function addValue(e, o) {
   var tr = cel("tr", e);
   var td = cel("td", tr);
   td.className = "label_left";
   td.noWrap = "true";
   if (o.flag)
      td.style.color = "red";
      
   td.innerHTML = o.label;
   td = cel("td", tr);
   td.noWrap = "true";
   if (o.flag)
      td.style.color = "red";
      
   if (!o.value || o.value == "undefined")
      td.innerHTML = "?";
   else
      td.innerHTML = o.value;
}

function addNode(e, node) {
   var td = cel("td", e);
   var table = cel("table", td);
   table.border = "1";
   table.cellSpacing = "1";
   table.cellPadding = "2";
   var tbody = cel("tbody", table);
   var tr = cel("tr", tbody);
   td = cel("td", tr);
   td.className = "label_left";
   td.noWrap = "true";
   td.colSpan = "2";
   td.style.color = "white";
   td.style.backgroundColor = "${gs.getProperty('css.base.color','#6699CC')}";
   td.innerHTML = node.name;
   for (var i = 0; i < node.values.length; i++)
      addValue(tbody, node.values[i]);
}

var diag_table = gel('diag_table');
var table = cel('table', diag_table);
table.border = "1";
table.cellSpacing = "1";
table.cellPadding = "2";
var tbody = cel('tbody', table);
for (var i = 0; i < g_diagnostics.length; i++)
   addValue(tbody, g_diagnostics[i]);


var nodes_table = gel('nodes_table');
var table = cel('table', nodes_table);
table.cellSpacing = "1";
table.cellPadding = "2";
var tbody = cel('tbody', table);
var tr;
for (var i = 0; i < g_nodes.length; i++) {
   if ((i % g_nodesAcross) == 0) 
      tr = cel("tr", tbody);

   addNode(tr, g_nodes[i]);
}
