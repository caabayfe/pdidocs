function assignCSAdminRole() {
    var userValues = user_sb.getValues(user_sb.getRightSelect());
    var ajaxLeftSelect = new GlideAjax('global.CSRoleAdministration');
    ajaxLeftSelect.addParam('sysparm_name', 'assignCSAdminRole');
    ajaxLeftSelect.addParam('sysparm_user_sysIds', userValues);
    ajaxLeftSelect.getXMLAnswer(loadResponseIntoLeftSelect);

    // Clear selections
    unselectOptions(user_sb.getRightSelect());
    unselectOptions(user_sb.getLeftSelect());
}

function refreshPage() {
    window.location.reload();
}

// Called when the UI page loads
addLoadEvent(function() {
    user_sb.clear(); //Load the users when the UI page loads

    //Fetch left options first
    var ajaxLeftSelect = new GlideAjax('global.CSRoleAdministration');
    ajaxLeftSelect.addParam('sysparm_name', 'getAvailableUsers');
    ajaxLeftSelect.getXMLAnswer(function(leftSelectResult) {
        //Then fetch what needs to be moved to right select
        var ajaxRightSelect = new GlideAjax('global.CSRoleAdministration');
        ajaxRightSelect.addParam('sysparm_name', 'getCSAdminUserSysIds');
        ajaxRightSelect.getXMLAnswer(function(rightSelectResult) {
            loadResponseIntoLeftSelect(leftSelectResult);
            moveOptionsIntoRightSelect(rightSelectResult);
        });
    });

    return false;
});

// Called when we get a response from the 'addLoadEvent' function -> getAvailableUsers
function loadResponseIntoLeftSelect(result) {
    var users = JSON.parse(result);
    if (users == null || users == undefined)
        return;

    // Loop through item elements and add each item to left slushbucket
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user_sb.addLeftChoice(user.sys_id, user.name);
    }
}

// Called when we get a response from the 'addLoadEvent' function -> getCSAdminUserSysIds
function moveOptionsIntoRightSelect(result) {
    if (result == null)
        return;

    var users = JSON.parse(result);
    var rightSelect = user_sb.getRightSelect();
    var leftSelect = user_sb.getLeftSelect();
    var leftOptions = leftSelect.options;

    // Loops through left slushbucket user options
    // Marks user options in left slushbucket as selected if they have SM admin role assigned (persisted)
    for (var i = 0; i < leftOptions.length; i++) {
        var leftOption = leftOptions[i];
        if (users.indexOf(leftOption.value.toString()) !== -1)
            leftOption.selected = true;
    }

    // Move the selected options from left to right
    try {
        user_sb.moveOptions(leftSelect, rightSelect, false);
    } catch (e) { // This exception is caused as our UI code asks for a form but, we are rendering a UI page in the frame
        // Once the items are moved to right slushbucket unselect them
        unselectOptions(user_sb.getRightSelect());
    }
}

// Un-select options in the selected bucket
function unselectOptions(select) {
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        option.selected = false;
    }
}
