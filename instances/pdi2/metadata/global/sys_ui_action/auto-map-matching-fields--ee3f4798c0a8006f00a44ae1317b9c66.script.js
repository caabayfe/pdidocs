current.update();
var sourceGR = new GlideRecord(current.source_table);
sourceGR.initialize();
var targetGR = new GlideRecord(current.target_table);
targetGR.initialize();

var targetGRElements = targetGR.getFields();

var fields = sourceGR.getFields();
for (var i = 0; i < fields.size(); i++) {
  var field = fields.get(i);
  var name = field.getName();
  var label = field.getED().getLabel();

  //skipe virtual fields like Tags 
  if (!field.getED().isInDatabase())
	  continue;
	
  var tname = matchFields(name, label);
  if (tname == 'manager' && targetGR.getElement(tname).getED().hasAttribute('no_auto_map'))
      continue;

  if (!isSkip(name) && tname != null && !isSkip(tname)) {
    createTransformEntry(name, tname);
  }
}

gs.addInfoMessage("Field maps created");

gs.setRedirect("sys_transform_map.do?sys_id=" + current.sys_id);

function isSkip(name) {
    // skip sys fields
    if (name == "sys_created_on" ||
        name == "sys_updated_on" ||
        name == "sys_created_by" ||
        name == "sys_updated_by" ||
        name == "sys_mod_count" ||
        name == "sys_class_name" ||
        name == "sys_id" ||
        name == "sys_import_set" ||
        name == "sys_import_row" ||
        name == "sys_import_state")
      return true;

    return false;
}

function createTransformEntry(sourceName, targetName) {
  var entryGR = new GlideRecord("sys_transform_entry");
  entryGR.addQuery("map",current.sys_id);
  entryGR.addQuery("source_table",current.source_table);
  entryGR.addQuery("source_field",sourceName);
  entryGR.addQuery("target_table",current.target_table);
  entryGR.addQuery("target_field",targetName);
  entryGR.query();
  if (!entryGR.next()) {
    entryGR.map = current.sys_id;
    entryGR.source_table = current.source_table;
    entryGR.source_field = sourceName;
    entryGR.target_table = current.target_table;
    entryGR.target_field = targetName;
    entryGR.insert();
  }
}

function matchFields(name, label) {
  var tname = matchName(name);
  if (tname != null)
    return tname;

  tname = matchLabel(label);
  if (tname != null)
    return tname;

  tname = matchLabelToName(label);
  if (tname != null)
    return tname;

  return null;
}

function matchName(name) {
  for(var i = 0; i < targetGRElements.size(); i++) {
    var field = targetGRElements.get(i);

    if (field.getED().isActive() && name == field.getName()) {
      return field.getName();
    }
  }

  return null;
}

function matchLabel(label) {
  label = label.toLowerCase();

  for(var i = 0; i < targetGRElements.size(); i++) {
    var field = targetGRElements.get(i);
    var tlabel = field.getLabel().toLowerCase();

    if (field.getED().isActive() && label == tlabel) {
      return field.getName();
    }
  }

  return null;
}

function matchLabelToName(name) {
  name = name.toLowerCase();

  for(var i = 0; i < targetGRElements.size(); i++) {
    var field = targetGRElements.get(i);

    if (field.getED().isActive() && name == field.getName()) {
      return field.getName();
    }
  }

  return null;
}
