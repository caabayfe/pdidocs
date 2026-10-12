//GLOBAL (for now)
var currentAssessableTypeInfo = new Object();
var u_g_form = new GlideForm('',true,true,true,true)
var gwt = new GwtMessage();

function assessableTypePicked(assessableType) {
    if(assessableType == '') return;
    
    var ajax = new GlideAjax("com.snc.assessment_core.AssociationCreationAjax");
    ajax.addParam("sysparm_method", "getMetricUsersAndAssessables");
    ajax.addParam("sysparm_metric_type_id", assessableType);
    ajax.getXML(function(response) {
        currentAssessableTypeInfo = new Object();
        var categories = response.responseXML.documentElement.getElementsByTagName('category');
        var categorySelect = gel('categories');
        categorySelect.innerHTML = '';
        for(var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var categoryId = category.getAttribute("id");
            var categoryDisplay = category.getAttribute("display");
            currentAssessableTypeInfo[categoryId] = new Object();
            currentAssessableTypeInfo[categoryId].display = categoryDisplay;
            
            //populate categories in the select
            var option =  cel('option');
            option.setAttribute('value', categoryId);
            option.textContent = categoryDisplay;
            categorySelect.appendChild(option);
            
            // setup assessable info
            var assessables = category.getElementsByTagName("assessableRecord");
            currentAssessableTypeInfo[categoryId].assessableRecords = new Array();
            for(var j = 0; j < assessables.length; j++) {
                var assessable = assessables[j];
                var assessableId = assessable.getAttribute("id");
                var assessableDisplay = assessable.getAttribute("display");
                currentAssessableTypeInfo[categoryId].assessableRecords.push({
                    "id": assessableId,
                    "display": assessableDisplay
                });
            }
            
            // setup category user info
            var categoryUsers = category.getElementsByTagName("categoryUser");
            currentAssessableTypeInfo[categoryId].categoryUsers = new Array();
            for(var k = 0; k < categoryUsers.length; k++) {
                var categoryUser = categoryUsers[k];
                var categoryUserId = categoryUser.getAttribute("id");
                var categoryUserDisplay = categoryUser.getAttribute("display");
                currentAssessableTypeInfo[categoryId].categoryUsers.push({
                    "id": categoryUserId,
                    "display": categoryUserDisplay
                });
            }
        }
        categorySelect.disabled = false;
        updateAllSlushBuckets();
    });
}

function associate() {
	var selectedCatUserOptions = $$("#slush_left :selected");
	var selectedCatUsers = [];
	for(var i = 0; i < selectedCatUserOptions.length; i++) {
		var value = selectedCatUserOptions[i].getAttribute('value');
		if(value != '')
			selectedCatUsers.push(value);
	}
	selectedCatUsers = selectedCatUsers.join(',');

	var selectedAssessableOptions = $$("#slush_right :selected");
	var selectedAssessables = [];
	for(var i = 0; i < selectedAssessableOptions.length; i++) {
		var value = selectedAssessableOptions[i].getAttribute('value');
		if(value != '')
    		selectedAssessables.push(value);
	}
	selectedAssessables = selectedAssessables.join(',');
	
	if(selectedCatUsers != '' && selectedAssessables != '') {
		var ajax = new GlideAjax("com.snc.assessment_core.AssociationCreationAjax");
		ajax.addParam("sysparm_method", "associateCategoryUsersToAssessables");
		ajax.addParam("sysparm_category_user_ids", selectedCatUsers);
		ajax.addParam("sysparm_assessable_ids", selectedAssessables);
		ajax.getXML(function(response) {
			u_g_form.addInfoMessage(gwt.getMessage("The selected category users are now stakeholders for the selected assessable records"));
		});	
	}
	
	if(selectedCatUsers == '')
	    u_g_form.addErrorMessage(gwt.getMessage('No category users selected'));
	
	if(selectedAssessables == '')
	    u_g_form.addErrorMessage(gwt.getMessage('No assessables selected'));
}

function updateAllSlushBuckets() {
	updateSlushBucket('slush_left');
	updateSlushBucket('slush_right');
}

function updateSlushBucket(/*String*/ bucketId) {
    // If there is no bucket id, return
    if(!bucketId) return;
    
    // If the bucket id is invalid, return
    var slush = gel(bucketId);
    if(!slush) return;

    // Get the currently selected category
    var categoryId = gel('categories').value;
	if(categoryId == '') return;
	var data;
	var filterText;
	// If we're updating the left slush bucket, the data we want is
	// the category users and the filter is the 'searchUsers' value
    if(bucketId == 'slush_left') {
        data = currentAssessableTypeInfo[categoryId].categoryUsers;
        filterText = gel('searchUsers').value;
    }
    // If we're updating the right slush bucket, the data we want is
    // the assessables and the filter is the 'searchAssessables' value
    else if(bucketId == 'slush_right') {
        data = currentAssessableTypeInfo[categoryId].assessableRecords;
        filterText = gel('searchAssessables').value;
    }

    // clear out the slush bucket
    slush.innerHTML = '';
    
    var slushIsEmpty = true;
    
    // for each of the possible data options
    for(var i = 0; i < data.length; i++) {
        // If the data option does not match the filter (case insensitive), 
        // continue
        if(data[i].display.toUpperCase().indexOf(filterText.toUpperCase()) < 0) 
            continue;
        
        // Make and add the option
        var option = cel('option');
        option.value = data[i].id;
        option.textContent = data[i].display;
        slush.appendChild(option);
        slushIsEmpty = false;
    }
    
    // If the slush bucket is empty, add the -- None -- option
    if(slushIsEmpty) {
        var option = cel('option');
        option.value = '';
        option.textContent = '-- None --';
        slush.appendChild(option);
    }
}

(function() {
	addLoadEvent(function() {
		var searchUsersInput = gel('searchUsers');
		searchUsersInput.onkeyup = function() {
			updateSlushBucket('slush_left');
		};
		
		var searchAssessablesInput = gel('searchAssessables');
		searchAssessablesInput.onkeyup = function() {
			updateSlushBucket('slush_right');
		};
	});
})();
