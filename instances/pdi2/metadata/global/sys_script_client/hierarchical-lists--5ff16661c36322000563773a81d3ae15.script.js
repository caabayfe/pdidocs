function onCellEdit(sysIDs, table, oldValues, newValue, callback) {callback(true);} 
function structureViewCheck(table) {
    if(!table){
        table = document.body; // $("em_alert_table");
    }
    if(!table){
        return;
    }
    var elements = [];
    var ids = "";
    table.select(".list_row[record_class='em_alert']").each(function(e){
        var sys_id = e.readAttribute("sys_id");
        elements[sys_id] = e;
        if (!ids){
            ids = sys_id;
        }else{
            ids = ids + "," + sys_id;
        }
    });
}

function removeHierarchicalArrowForNonPrimaries() {
	//iterate over all rows
	jQuery(".list_row[record_class='em_alert']").each(function(){
		var foundImg = false;
		
		var row = jQuery(this);
		//Find if there is the groupAlerts_m (_a _r _c) images exist. If so - leave arrow marker.
		//The images names are groupAlerts_a, groupAlerts_c, groupAlerts_m, groupAlerts_r for primaries
		//and groupAlertsCo for secondaries. That's why it's enogth to search for groupAlerts_
			if (!foundImg) { //no need to keep of checking if found allready
				//get to the image object (if exist)
				if(row.html().indexOf('groupAlerts_') !== -1){
					foundImg = true;
				}
			}			
		//remove none-primaries (no image)
		if (!foundImg) {
			//find the cell with the the checkbox and the arrow
			row.select(".list_decoration_cell").each(function(){
				//find the arrow icon to remove it
				this.select(".icon-vcr-right").each(function(eArrowIcon) { 
					eArrowIcon.style.display = "none";
				});	
				// For RTL languauges
				this.select(".icon-vcr-left").each(function(eArrowIcon) { 
					eArrowIcon.style.display = "none";
				});		
			});
		}
	});
}

//call functions on load and re load
removeHierarchicalArrowForNonPrimaries();
structureViewCheck();
CustomEvent.observe("partial.page.reload",removeHierarchicalArrowForNonPrimaries);
CustomEvent.observe("partial.page.reload",structureViewCheck);

//Remove extra line, checkbox and buttons from secondaries list
CustomEvent.observe("list.section.toggle",function(){
	
	// Remove hierarchical arrow from direct children of every expanded parent (like in case of group of groups)
	removeHierarchicalArrowForNonPrimaries();
	
	$$('div.hierarchical[tab_caption="Alerts"]').each(function(e){
		e.down("table").next().style.width = "";
		e.select("div.list_nav_spacer").each(function(e1){e1.remove();});
		e.select(".hierarchical.list_nav_top .list_actions_left button").each(function(e1){e1.style.display = "none";});
		
		e.select("button.btn-primary").each(function(e1){e1.style.display = "none";});
		e.select("button.btn-default").each(function(e1){e1.style.display = "none";});
				
		//remove the Goto (fast search) nav bar
		e.select("span.navbar-left").each(function(e1){e1.style.display = "none";});
		
		e.select(".hierarchical.list_nav_bottom.list_nav").each(function(e1){e1.style.display = "none";});
		e.select('.hierarchical input[type="checkbox"]').each(function(e1){e1.style.display = "none";});
		e.select('.hierarchical input[type="checkbox"]').each(function(e1){e1.remove();});
	});
});
