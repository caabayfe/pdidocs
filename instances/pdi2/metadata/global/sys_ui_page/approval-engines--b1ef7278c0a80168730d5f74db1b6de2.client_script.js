var t = gel("engines");
var tbody = t.firstChild;

initEngines();

function initEngines() {
   var tables = [];
   for (var i = 0; i < g_engines.length; i++) {
      buildEngineTR(g_engines[i], i);
      tables.push(g_engines[i].table);
   }
   var e = gel("tables");
   e.value = tables.join(",");
}

function buildEngineTR(engine, i) {
   var tr = cel("tr", tbody);
   if ((i % 2) == 0)
      tr.className = "even";
   else
      tr.className = "odd";
      
   var hasEngine = false;
   if (engine.approval)
      hasEngine = true;
      
   var td = cel("td", tr);
   td.className = "vt";
   td.style.whiteSpace = "nowrap";
   if (hasEngine)
      cel("b", td).innerText = engine.label;
   else
      td.innerText = engine.label;
   
   td = cel("td", tr);
   td.className = "vt";
   td.style.whiteSpace = "nowrap";
   if (hasEngine)
      cel("b", td).innerText = engine.table;
   else
      td.innerText = engine.table;
   
   td = cel("td", tr);
   td.className = "vt";
   buildEngineSelect(td, engine);
   td = cel("td", tr);
   td.className = "vt";
   td.innerText = engine.notes;
}

function buildEngineSelect(td, engine) {
   var select = cel("select", td);
   select.className = "vt";
   select.id = "engine_" + engine.table;
   select.name = select.id;
   select.title = "Approval Engine";
   if (engine.disable)
      select.disabled = "disabled";
   addOption(select, "approval_engine", "Approval Rules", engine.approval == "approval_engine");
   addOption(select, "process_guide", "Process Guides", engine.approval == "process_guide");
   addOption(select, "off", "Turn engines off", engine.approval == "off");
}

function save() {
}
