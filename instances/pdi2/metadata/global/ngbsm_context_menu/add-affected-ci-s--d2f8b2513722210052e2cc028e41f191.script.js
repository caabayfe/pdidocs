// Branch based on if there is a selection of multiple CIs or not
if(bsmSelection.getSelection().nodes.length > 1)
	addMultipleAffectedCIs();
else
	addAffectedCI();

// Function to add one CI as an affected CI
function addAffectedCI() {
    var taskId = bsmURL.getParameter('fromTask');
    var cmdbId = item.id;
	
	// Only process if there is a valid task and CI 
    if (taskId && cmdbId) {
		// Validate that the CI is not already an affected CI
        var affectedCI = new GlideRecord('task_ci');
        affectedCI.addQuery('task', taskId);
        affectedCI.addQuery('ci_item', cmdbId);
        affectedCI.query();
        if (!affectedCI.hasNext()) {
			// Since it did not exist, add it as an affected CI
            affectedCI.task = taskId;
            affectedCI.ci_item = cmdbId;
            affectedCI.insert();
	
			// Send message notifying that the CI was added
            $rootScope.$broadcast('ngbsm.success', {
                success: 'The CI ' + item.name + ' has been added as an affected CI'
            });
        } else {
			// Send a message that the CI is already an affected CI
			$rootScope.$broadcast('ngbsm.success', {
                success: 'The CI ' + item.name + ' is already an affected CI'
            });
		}
    }
}

// Function to add all selected CIs as affected CIs
function addMultipleAffectedCIs() {
    var taskId = bsmURL.getParameter('fromTask');
	var nodes = bsmSelection.getSelection().nodes;
	var added = '';
	
	// Only process if there is a valid task ID
    if (taskId) {
		// Add all CI's in the current selection if they are node clusters/collapsed
		for(var i = 0; i < nodes.length; i++) {
			if(!nodes[i].isCollapsed || nodes[i].isCluster) {
				// Attempt to add the CI as an affected CI
				var affectedCI = new GlideRecord('task_ci');
				affectedCI.addQuery('task', taskId);
				affectedCI.addQuery('ci_item', nodes[i].id);
				affectedCI.query();
				if (!affectedCI.hasNext()) {
					affectedCI.task = taskId;
					affectedCI.ci_item = nodes[i].id;
					affectedCI.insert();

					// If added, add it to the list of added CIs
					if(added === '')
						added += nodes[i].name;
					else
						added += ', ' + nodes[i].name;
				}
			}
		}
		
		// Notify user of which CI's got added or that they didn't get added
		if(added !== '') {
			$rootScope.$broadcast('ngbsm.success', {
				success: added + ' have been added as affected CIs'
			});
		} else {
			$rootScope.$broadcast('ngbsm.success', {
				success: 'Selected CIs are already affected CIs or cannot be added'
			});
		}
    }
}
