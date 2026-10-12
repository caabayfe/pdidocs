var wordsToExclude = /^sys_|^\.\.\.|number|kb_knowledge_base|topic|workflow_state|kb_category|category|disable_commenting|disable_suggesting|author/;// Option items to exclude

// Deletes the items that match wordsToExclude from the passed list of select elements
var excludeOptions = function(theSelects) {
	if(!theSelects)
		return;
	for (var i=0; i<theSelects.length;i++) {
		var myOptions = theSelects[i].getElementsByTagName('option');
		for (var j=0; j<myOptions.length; ) {
			if (myOptions[j].value.match(wordsToExclude))
				theSelects[i].removeChild(myOptions[j]);
			else
				j++;
		} 
	}		
};

var getSelects = function() {
	var rowCondition = document.getElementsByTagName('tr');
	var result = [];
	for (var i=0; i<rowCondition.length; i++) {
		if (rowCondition[i].className === 'filter_row_condition') {
			for (var j=0; j<rowCondition[i].children.length; j++) {
				var child = rowCondition[i].children[j];
				if (child.id === 'field' && child.tagName.toLowerCase() === 'td') {
					for (var k=0; k<child.children.length; k++) {
						var grandChild = child.children[k];
						if (grandChild.tagName.toLowerCase() === 'select' && grandChild.getAttribute('title').toLowerCase() === 'choose input')
							result.push(grandChild);
					}
				}
			}
		}
	}
	if(result.length>0)
		return result;
	else
		return null;
};

function onLoad() {
	setPreference("filter.show_related", "no");
	addAfterPageLoadedEvent(function() { // Delete the unwanted options after the dropdowns are loaded
		var checkExist = setInterval(function() {		            				
    		var mySelects = getSelects();
			if (mySelects) {
				clearInterval(checkExist); // Stop checking
				excludeOptions(mySelects);
			}
	   }, 100); // check every 100ms
	});
}
