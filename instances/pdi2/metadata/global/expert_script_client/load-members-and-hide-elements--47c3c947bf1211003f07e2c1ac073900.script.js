function onLoad() {
    //hide the variable group from the form, it should
    //only show on the first panel
    hideGroupField();

    //hide text under list collector, unneccesary now
    //the filters have been removed.
    hideFilterMessage();

    g_form.setValue('rotation_interval_type', 'weekly');
    g_form.setValue('rotation_interval_count', 1);
    g_form.setValue('dow_for_rotate', '');

    //Apply a default filter to the list collector variable
    var group = g_form.getValue('group');
    var collectorName = 'members';

    //fires of a query which when returns will
    //call handleQueryResponse
    gatherMembers(group);
    
	//Hide the list collector until we've set the filter
    g_form.setDisplay(collectorName, false);

    function hideGroupField() {
        //this field is needed to be carried over from the previous panel
        //but we don't want it to be visible
        g_form.setDisplay('group',false);
    }

    function hideFilterMessage() {
        //Warning! This won't work if the id changes! Which it might do in upcoming UI change.
        //however, children position in document tree in relation to each other might also
        //change.
        document.getElementById('members_select_0_add_remove_message_table').style.display = "none";
    }

    function gatherMembers(group) {
        //comma separated list of sysids belonging to members
        var members = new GlideRecord('sys_user_grmember');
        members.addQuery('group', group);
        members.addQuery('user.active', true);
        members.query(handleQueryResponse);
    }

    function handleQueryResponse(rec) {
        //will be called when the async request to
        //glide returns the records
        var sysids = '';
        while(rec.next()) {
            sysids += (rec.user + ',');
        }
        var filterString = 'sys_idIN' + sysids;

        setCollectorFilter(filterString);
    }

    function setCollectorFilter(filterString){
        //Test if the g_filter property is defined on our list collector.
        //If it hasn't rendered yet, wait 100ms and try again.
        if (eval('typeof(' + collectorName + 'g_filter)') == 'undefined' ) {
            setTimeout(setCollectorFilter, 100);
            return;
        }

        //Find and hide the filters
        hideFilters();

        //Reset the filter query
        eval(collectorName + 'g_filter.reset()');
        eval(collectorName + 'g_filter.setQuery("' + filterString + '")');
        eval(collectorName + 'acRequest(null)');

        //Redisplay the list collector variable
        g_form.setDisplay(collectorName, true);
    }
}

function hideFilters() {
	var fil = document.querySelector(".list_name > .container");
	var rows = fil.getElementsByTagName("tr");
	for (var i = 0; i < rows.length; i++) {
		if(rows[i].id.indexOf("filter") > 0)
			rows[i].style.display = 'none';
	}
	
	var divs = fil.getElementsByTagName("div");
	for (i = 0; i < divs.length; i++) {
		if(divs[i].id.indexOf("filter") > 0)
			divs[i].style.display = 'none';
	}
}
