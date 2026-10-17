addLoadEvent(onMappingAssistLoad);
var g_map_loading = false; 

function onMappingAssistLoad() {
  g_map_loading = true;
  // populate existing map fields
  var entryGR = new GlideRecord("sys_transform_entry");
  entryGR.addQuery("map",'${sysparm_map_sys_id}');
  entryGR.query();
  while (entryGR.next()) {
    // load the source fields
    var sourceField = entryGR.source_field;
    var targetField = entryGR.target_field;

    // skip system fields
    if (targetField.indexOf('sys_') == 0)
      continue;

    setSelected(sourceField, targetField);
  }
  g_map_loading = false;
}

function setSelected(sourceField, targetField) {
    var source_field_array = source_fields_leftzone.getValues();
    var target_field_array = target_fields_leftzone.getValues();

    for(i = 0; i < source_field_array.length; i++) {
      if (sourceField == "[Script]") {
        source_fields_rightzone.add("[Script]", "[Script]");
        break;
      }

      if (source_field_array[i] == sourceField) {
        selectTableSource.copyOrMoveBetweenLists(source_fields_leftzone, i, source_fields_rightzone, -1);
        break;
      }
    }

    for(i = 0; i < target_field_array.length; i++) {
      if (target_field_array[i] == targetField) {
        selectTableTarget.copyOrMoveBetweenLists(target_fields_leftzone, i, target_fields_rightzone, -1);
        break;
      }
    }

    source_fields_rightzone.clearSelected();
    target_fields_rightzone.clearSelected();
}
  function onActionSelectMapped(sel) {
    var el = gel('show_mapped');
    if (sel.value == "mapped") {
      sourcepreview_fields = source_fields_rightzone.getValues().join(',');
      targetpreview_fields = target_fields_rightzone.getValues().join(',');
      el.value = "mapped";
    } else {
      sourcepreview_fields = "*";
      targetpreview_fields = "*";
      el.value = "all";
    }

    sourcepreview_showPreview();
    targetpreview_showPreview();
  }

  function showPreview() {
    if (g_map_loading) 
      return; 

    var el = gel('show_mapped');
    onActionSelectMapped(el);
  }
function onSubmit() {
  var source_field_array = source_fields_rightzone.getValues();
  var target_field_array = target_fields_rightzone.getValues();

  if (source_field_array.length == 0 || target_field_array.length == 0) {
    cancel();
    return true;
  }

  if (source_field_array.length != target_field_array.length) {
    alert("Source field count does not match target field count");
    return false;
  }

  var ss = source_field_array.join(',');

  // set the selected list as a comma seperated string for server side
  var el = gel('source_field_list'); 
  el.value=ss;

  ss = target_field_array.join(',');

  // set the selected list as a comma seperated string for server side
  el = gel('target_field_list'); 
  el.value=ss;

  return true;
}

function cancel() {
  var el = gel('cancelled');
  el.value = "true";
}
