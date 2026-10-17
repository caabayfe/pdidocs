function transform(input) {
    const failure = {
        'status': false,
        'action': 'unmark_as_gap'
    };

    if (!input.query) {
        return failure;
    }

    const parts = input.query.split('^');
    const groupIdPart = parts.find(part => part.startsWith('group_id='));
    var groupId = groupIdPart ? groupIdPart.split('=')[1] : null;
	var groupDescription = "";
    /**
     * description is of format [#group_id#] Description title
     * So we can extract group_id by parsing int from group. This util does exactly this
     */
    function extractGroupId(description) {
        if (description === null) {
            return null;
        }
        var start = description.indexOf("[");
        var end = description.indexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
            return parseInt(description.substring(start + 1, end), 10);
        }
        // Fallback to query in case group description was somehow edited
        gs.info("[Knowledge Center]: Could not find group id for description: " + description + ". Trying to run Glide Query");
        return getGroupIdByDescription(description);
    }

    function getGroupIdByDescription(description) {
        var gr = new GlideRecord('kb_gap_candidates');
        gr.addQuery('group_description', description);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue('group_id');
        }

        return null;
    }

	function getGroupDescriptionFromGroupId(groupId) {
		var gr = new GlideRecord('kb_gap_candidates');
        gr.addQuery('group_id', groupId);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue('group_description');
        }

        return null;
	}

    /**
     * For Gaps List View, we can only group by one field. We used group_description field to have description
     * in List View and not random number. So our query will have group_description instead of group_id
     */
    if (groupId === null) {
        const groupDescriptionPart = parts.find(part => part.startsWith('group_description='));
        groupDescription = groupDescriptionPart ? groupDescriptionPart.split('=')[1] : null;
        groupId = extractGroupId(groupDescription);
    } else {
		groupDescription = getGroupDescriptionFromGroupId(groupId);
	}

    if (!groupId) {
        gs.info("[Knowledge Center]: Could not find group id to unmark group as a gap");
        return failure;
    }

	const success = {
        'status': true,
        'action': 'unmark_as_gap',
		'groupDescription': groupDescription
    };
    return success;
}
