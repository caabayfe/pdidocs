function ($uibModal, $scope, spUtil, $window, glideSystemProperties) {
	/* widget controller */
	var c = this;
	
	c.table_required = false;
	c.data.selected_tables = [];
	c.data.tables_to_be_shown = [];
	c.disable_left_navigation = true;
	c.disable_right_navigation = true;
	
	//var snBigTables = glideSystemProperties.get("com.glide.domain.audit.big_tables", "");
	
	c.snBigTables = c.data.snBigTables;
	
	c.update = function() {
		if (c.data.selectedTables.length < 5) {
			for (var i = 0; i < c.data.selectedTables.length; i++) {
				if (c.snBigTables.indexOf(c.data.selectedTables[i].name) === -1) {
					c.table_required = true;
				}
			}
		} else {
			c.server.get({selectedTables: c.data.selectedTables, verboseLogging: c.data.verboseLogging}).then(function(r) {
				c.server.refresh().then(function(){
					$scope.$emit("$$uiNotification", {message: c.data.updateMessage});
				});
			});
		}
	}
	
	c.removeTable = function(){
		var tempData = c.data.selected_tables;
		c.data.selected_tables.splice(0, c.data.selected_tables);
		
		for (var i = 0; i < tempData.length; i++) {
			for (var j=0; j < c.data.selectedTables.length; j++) {
				if(tempData[i] == c.data.selectedTables[j].name) {
					c.data.selectedTables.splice(j,1);
					break;
				}
			}
	
			c.data.tables.push({
				name: tempData[i]
			});
		}
	}
	
	c.addTable = function(){
		var tempData = c.data.tables_to_be_shown;
		c.data.tables_to_be_shown.splice(0,c.data.tables_to_be_shown);		
		
		for(var i = 0; i < tempData.length; i++){
			for(var j=0; j < c.data.tables.length; j++){
				if(tempData[i] == c.data.tables[j].name){
					c.data.tables.splice(j,1);
					break;
				}
			}
			
			c.data.selectedTables.push({
				name: tempData[i]
			});
		}
	}
}
