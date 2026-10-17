applyChanges = function() {
   var fLayout = gel('map_layout').value;
   var fInterval = gel('map_interval').value;
   var fLevels = gel('map_levels').value;
   var fCIView = gel('map_ciview').value;
   var fTableName = bsmMap.getParam('table');
   var fId = bsmMap.getParam('id');	

   reloadNewAttributes('table=' + fTableName + ',id=' + fId + ',layout=' + fLayout +
      ',level=' + fLevels + ',ciview=' + fCIView + ',interval=' + fInterval);
}

reloadNewAttributes = function(attributes) {
   var iam = self;
   if (iam.parent && iam.parent != iam)
      iam = iam.parent;

   var href = iam.location.href;
   var sysparam = "&sysparm_attributes=";
   var p = href.indexOf(sysparam);
   if (p == -1)
      p = href.indexOf("?sysparm_attributes=");
   p += sysparam.length;

   var afterAttributes = "";
   var afterIndex = href.indexOf("&", p);
   if (afterIndex > -1)
      afterAttributes = href.substring(afterIndex);

   var new_href = href.substring(0,p) + attributes + afterAttributes;

   if (new_href.indexOf("&sysparm_modified") == -1)
      new_href += "&sysparm_modified=true";

   iam.location.href = new_href;
}

loadDefaults = function() {
   // the layout parameter comes from the diagram because it might figure out a custom layout may be saved
   var layout = bsmMap.layoutStyle;
   if (layout == 'custom' || bsmMap.getData("layout") == 'custom')
      addSelectValue('map_layout', 'Custom', 'custom');
   selectValue('map_layout', layout); 

   // the other parameters come from the URL
   var interval = bsmMap.getInterval();
   selectValue('map_interval', interval);
   var level = bsmMap.getLevel();
   selectValue('map_levels', level);
   selectValue('map_ciview', bsmMap.getParam('ciview'));
}

addSelectValue = function(element_name, new_text, new_value) {
   var e = gel(element_name);
   e.options[e.options.length] = new Option(new_text, new_value);
}

selectValue = function(element_name, selected_value) {
   var set_it = false;
   var e = gel(element_name);
   for (var i=0; i<e.options.length; i++) {
      if (e.options[i].value == selected_value) {
         e.options[i].selected = true;
         set_it = true;
         break;
      }
   }
   if (!set_it)
      alert("No option '" + selected_value + "' for " + element_name);
}

loadDefaults(); 
