function perfChanged() {
  if (window['homeRefresh'] != undefined) 
    homeRefresh(); 
}

function graphChange(e, guid, graph) {

  if (typeof e == 'undefined') e = window.event;

  var target = e.target ? e.target : e.srcElement;
  toggleGSFTCheck(target);

  regraph(guid, graph);
}

function regraph(guid, graph) {
 // find control group
  var c = gel('controls_' + guid + '_' + graph);
  if (!c)
    return;

  var graph = gel('graph_' + guid + '_' + graph);
  if (!graph)
    return;

  var isIE = navigator.userAgent.toLowerCase().indexOf("msie") >= 0;
  
  var kids = c.getElementsByTagName('td');
  var checked = new Array();
  checked.push(new Date().getTime());
  for (var i = 0 ; i != kids.length; i++) {

    var hasChecked = isIE ? kids[i].getAttributeNode('gsft_checked') != null : kids[i].hasAttribute('gsft_checked');
    if (!hasChecked)
       continue;

    var test = kids[i].getAttribute('gsft_checked');
    if (test != 'true')
       continue;
    
    checked.push(kids[i].id);
  }

  var base = graph.getAttribute('gsft_base_src');
  base = base + 'sysparm_lines=' + checked.join();
  graph.src = base;

}

function toggleGSFTCheck(target) {
   var attr = target.getAttribute('gsft_checked');
  
   if (attr == 'true')
      target.setAttribute('gsft_checked', 'false');
   else
      target.setAttribute('gsft_checked', 'true');


   if (target.getAttribute('gsft_checked') == 'false') {
      target.style.backgroundColor = '';
      target.setAttribute('gsft_image', target.style.backgroundImage);
      target.style.backgroundImage = '';
   }
   else {
      target.style.backgroundColor = target.getAttribute('gsft_base_color');
      target.style.backgroundImage = target.getAttribute('gsft_image');
   }
}

function addGraphLine(guid, graph) {
  var c = gel('controls_' + guid + '_' + graph);

  var select = gel('add_' + guid + '_' + graph);
  if (!select)
    return;

  var value = select.value;
  if (!value)
    return;

  var index = select.selectedIndex;
  var label = select.options[index].text;
  var color = select.options[index].getAttribute('gsft_base_color');
  addLineControl(c, value, label, color, guid, graph);
  regraph(guid, graph);
}

function addLineControl(c, value, label, color, guid, graph) {
  var tr = c.getElementsByTagName('tr')[0];
  var td = document.createElement('td');
  var debug = td;
  tr.appendChild(td);

  var table = document.createElement('table');
  td.appendChild(table);
  table.cellSpacing="0";
  table.cellPadding="0";
  table.style.border="1px solid black";

  var tb = document.createElement('tbody');
  table.appendChild(tb);
  var tr = document.createElement('tr');
  tb.appendChild(tr);

  var td = document.createElement('td');
  tr.appendChild(td);
  td.style.width="12px"; 
  td.style.height="12px";
  td.style.backgroundColor=color;
  td.setAttribute('gsft_checked', 'true');
  td.setAttribute('gsft_base_color', color);
  td.id = value;
  td.onclick= function(event) { graphChange(event, guid, graph); };


  var tr = c.getElementsByTagName('tr')[0];
  var td = document.createElement('td');
  tr.appendChild(td);
  td.innerHTML = label;
}
