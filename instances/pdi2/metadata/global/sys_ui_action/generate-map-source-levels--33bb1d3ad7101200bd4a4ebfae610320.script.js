//Client-side 'onclick' function
function runClientCode(){
	var field = g_form.getValue('aggregate_field');
	//alert(field);
   if(field.slice(-8) !== 'location'){
	  alert(getMessage("You can automatically generate a map source levels only for fields that reference the location table (that end in .location). Select this type of field and try again."));
      return false;  //Abort submission
   } else{
	   var r = confirm(getMessage("Are you sure you want to automatically generate map source levels?"));
		if (r != true) 
			return false;  //Abort submission

   }
	  
	//alert('is location');
	   
   //Call the UI Action and skip the 'onclick' function
    gsftSubmit(null, g_form.getFormElement(), 'populateHierarchyMapSource'); //MUST call the 'Action name' set in this UI Action
}


//Ensure call to server-side function with no browser errors
if(typeof window == 'undefined')
   populateHierarchy();

//Server-side function
function populateHierarchy(){
	
	//check that there is no child already defined
	var grChild = getGlideRecord('sys_report_map_source','parent',current.sys_id);	
	if (grChild!='' && grChild.sys_id != ''){
		gs.addErrorMessage(gs.getMessage("Map source levels can be automatically generated only when a map source has no child map source. Remove the child map source and try again."));

		return false;
	}
	
	//create 1rst level
    var grType = getGlideRecord('sys_report_map_type','key','level_1');	
	var grTypeMapping = getGlideRecord('sys_report_map_source_mapping','name','Country mappings');	
	var name = current.name + ' (level 1)';
	var field = current.aggregate_field + '.country';
	var sysId = createMapSource(name, current.table, field,grType.sys_id, 'mapping', 'hc-key', current.sys_id, grTypeMapping.sys_id );
		
	//create 2nd level
    grType = getGlideRecord('sys_report_map_type','key','level_2');	
	grTypeMapping = getGlideRecord('sys_report_map_source_mapping','name','Region and state mappings');	
	name = current.name + ' (level 2)';
	field = current.aggregate_field + '.state';
	sysId = createMapSource(name, current.table, field,grType.sys_id, 'mapping', 'hc-key', sysId, grTypeMapping.sys_id );
		
	//create 3rt level
    grType = getGlideRecord('sys_report_map_type','key','level_3');	
	name = current.name + ' (level 3)';
	field = current.aggregate_field + '.city';
	createMapSource(name, current.table, field, grType.sys_id, 'use_lat_lon', 'hc-key', sysId, '');
		
   gs.addInfoMessage(gs.getMessage('Map source hierarchy created! Three map source levels were created: {0} (level 1), {0} (level 2), {0} (level 3)' ,current.name));

}

function getGlideRecord(table, field, value){
	var gr = new GlideRecord(table);
	gr.addQuery(field,value);
	gr.query();
	if(gr.next())
		return gr;
	
	return '';
	
}

function createMapSource(name, table, field, type, typeMapping, joinByColumn, parent,reportMapSourceMapping){
	var gr = new GlideRecord('sys_report_map_source');
	gr.initialize();
	gr.setValue('name',name);
	gr.setValue('table',table);
	gr.setValue('aggregate_field',field);
	gr.setValue('type',type);
	gr.setValue('type_mapping',typeMapping);
	gr.setValue('join_by_column',joinByColumn);
	gr.setValue('parent', parent);
	gr.setValue('report_map_source_mapping',reportMapSourceMapping);
	gr.setValue('active','true');
	
	return gr.insert();
}
