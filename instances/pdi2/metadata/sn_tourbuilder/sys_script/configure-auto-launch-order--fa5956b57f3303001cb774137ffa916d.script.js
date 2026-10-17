(function executeRule(current, previous /*null when async*/) {

	var gta, 
		ALTours,
		data = {
			autolaunchOn :[],
			autolaunchOff:[]
		};
	
	/** If auto-launch was previously enabled, it should be enabled again
	* and Tour should be at the end of the current auto-launch order
	*/
	if(current.active == true  && current.autolaunch_order < 0){
		 gta  = new GTAutoLaunchController();
		 ALTours  = gta.getAllAutoLaunchToursforPage(current.context);
		 current.autolaunch_order = ALTours.length + 1 ; 
	} else if(current.active == false && current.autolaunch_order > 0){
		//updated the auto-launch order on the related page to account for the removed tour
		 gta  = new GTAutoLaunchController();
		 ALTours  = gta.getAllAutoLaunchToursforPage(current.context).sort(function(a, b){return a.order - b.order;});
		for(var i = 0; i < ALTours.length; i++){
			if(current.autolaunch_order != ALTours[i].order){
				data.autolaunchOn.push(ALTours[i].id);
			}	
		}
		gta.updateToursForPage(data);
		/*Setting autolaunch order to -1,
		so we can know that tour has been autolaunch enabled before it has been made inactive. 
		*/
		current.autolaunch_order  = -1;
	}


})(current, previous);
