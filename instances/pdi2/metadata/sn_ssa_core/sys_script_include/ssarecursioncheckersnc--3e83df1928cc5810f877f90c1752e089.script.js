var SSARecursionCheckerSNC = Class.create();
SSARecursionCheckerSNC.prototype = {
    initialize: function() {
        this.recStack = new Object();
    },

    isRecursiveLoop: function(elementGroup) {
		var state = this.recStack[elementGroup.sys_id + ''];
		if(gs.nil(state)) {
			//Never visited
			this.recStack[elementGroup.sys_id + ''] = '-1'; //Visiting now
			//now get the first element and second element and visit them if they are group
			if (elementGroup.first_element.sys_class_name == 'ssa_pattern_element_group'){
				var firstElement = new GlideRecord(SSAConstants.TABLE_PATTERN_ELEMENT_GROUP);
				if (firstElement.get(elementGroup.first_element) && this.isRecursiveLoop(firstElement))
					return true;
			} 
			if (elementGroup.second_element.sys_class_name == 'ssa_pattern_element_group'){
				var secondElement = new GlideRecord(SSAConstants.TABLE_PATTERN_ELEMENT_GROUP);
				if (secondElement.get(elementGroup.second_element) && this.isRecursiveLoop(secondElement))
					return true;
			} 
			this.recStack[elementGroup.sys_id + ''] = '1';//Visited
			return false;
		}
		else if(state == '-1') 
			return true;//It is in call stack
		
		else if(state =='1') 
		//Already visited
			return false;
		
    },

    type: 'SSARecursionCheckerSNC'
};
