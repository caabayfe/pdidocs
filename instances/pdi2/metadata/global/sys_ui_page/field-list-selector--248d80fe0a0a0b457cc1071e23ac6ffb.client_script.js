var fieldListSelectorValues = getHiddenInputValuesMap(document.body);
showFieldListTree();

function showFieldListTree(){
   if (!fieldListSelectorValues["sysparm_table"]) {
      alert("Missing sysparm_table parameter");
      destroyTree();
      return;
   }
   
   var types = fieldListSelectorValues["sysparm_types"];
   if (!types)
      types = [];
   else {
      types = types + '';
      types = types.split(';');
      
   }
   
   var refTables = fieldListSelectorValues["sysparm_ref_tables"];
   if (!refTables)
      refTables = [];
   else {
      refTables = refTables + '';
      refTables = refTables.split(';');
   }
	
	var matchTypesAndTables = fieldListSelectorValues["sysparm_match_types_and_tables"] === 'true';
	
   
   var t = new ElementTree(fieldListSelectorValues["sysparm_table"], "Select Element", 'tableTreeDiv');
   t.setOnClick(elementTreeOnClick);
   t.showRootNode = true;
   t.setAccessTable(fieldListSelectorValues["sys_target"]);
   
   for (var i = 0; i < types.length; i++)
      t.addType(types[i]);
   
   for (var i = 0; i < refTables.length; i++)
      t.addReferenceTable(refTables[i]);
	
	t.setMatchTypesAndTables(matchTypesAndTables);
   
   var rootNode = new ElementTreeNode(t, "", fieldListSelectorValues["sysparm_label"]);
   rootNode.setCanExpand(true);
   rootNode.show();
   rootNode.expand();
}

function elementTreeOnClick(node){
   var prefix = fieldListSelectorValues["sysparm_prefix"];
   if (!prefix)
      prefix = "";
   
   // handle the __dollar__ replacement since trying to use a dollar sign followed by a { causes jelly parsing issues
   prefix = prefix.replace(/__dollar__/g, "$");
   
   var suffix = fieldListSelectorValues["sysparm_suffix"];
   if (!suffix)
      suffix = "";
   
   suffix = suffix.replace(/__dollar__/g, "$");
   
   var field = prefix + node.id + suffix;
   var elementID = fieldListSelectorValues["sysparm_elementID"];
   var element = gel(elementID);
   // if this is a SELECT element, don't allow duplicates
   if (element.tagName.toLowerCase() == "select") {
      for (var i = 0; i < element.options.length; i++) {
         if (element.options[i].value == field) {
            alert(node.text + " is already in the list");
            return;
         }
      }
      
      // Append the entry
      addOption(element, field, field);
      
   } else if (element.tagName.toLowerCase() == "input") {
      // input - set its value
      element.value = field;
      
   } else {
      // anything else set its innerHTML
      element.innerHTML = field;
   }
   
   if (element["onchange"])
      element.onchange();
   
   destroyTree();
}

function destroyTree(){
   GlideDialogWindow.prototype.locate(gel('tableTreeDiv')).destroy();
}
