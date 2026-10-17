(function executeRule(current, previous /*null when async*/) {

		var parentScreens = new GlideAggregate('sys_ux_screen');
		parentScreens.addAggregate('COUNT');
		parentScreens.addQuery('macroponent', current.getValue('macroponent'));
		parentScreens.query();
		if(parentScreens.next()){
			if(parentScreens.getAggregate('COUNT') == '0'){
				var macroponent = current.macroponent.getRefRecord();
				macroponent.deleteRecord();
			}
		}
		
	})(current, previous);
