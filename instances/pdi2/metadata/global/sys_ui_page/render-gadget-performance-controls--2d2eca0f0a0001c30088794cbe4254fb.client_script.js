function perfChangeInterval(select) {
  setPreference('performance_graph_interval', perfGetSelectValue(select), perfChanged); 
}

function perfChangeSize(select) {
  setPreference('performance_graph_size', perfGetSelectValue(select), perfChanged); 
}

function perfGetSelectValue(select) {
  var index = select.selectedIndex;
  return select.options[index].value;
}

function perfChanged() {
  if (window['homeRefresh'] != undefined) 
    homeRefresh(); 
}

function perfSetSelectedInterval() {
  if (!g_perfInterval) 
    return; 
  
  perfSetSelected('perf_interval', g_perfInterval);
}

function perfSetSelectedSize() {
  if (!g_perfSize) 
    return; 
  
  perfSetSelected('perf_size', g_perfSize);
}

function perfSetSelected(name, value) {
  var e = gel(name);
  for (var i = 0; i != e.options.length; i++) {
     if (e.options[i].value == value) {
       e.options[i].selected = true;
     }
  }
}

perfSetSelectedInterval();
perfSetSelectedSize();
