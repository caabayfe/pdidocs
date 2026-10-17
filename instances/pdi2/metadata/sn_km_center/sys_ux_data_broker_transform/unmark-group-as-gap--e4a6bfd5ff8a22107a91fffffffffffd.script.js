function transform(input) {
    if (!input.query) {
        return false;
    }

    const parts = input.query.split('^');
    const groupIdPart = parts.find(part => part.startsWith('group_id='));
    var groupId = groupIdPart ? groupIdPart.split('=')[1] : null;

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

    /**
     * For Gaps List View, we can only group by one field. We used group_description field to have description
     * in List View and not random number. So our query will have group_description instead of group_id
     */
    if (groupId === null) {
        const groupDescriptionPart = parts.find(part => part.startsWith('group_description='));
        const groupDescription = groupDescriptionPart ? groupDescriptionPart.split('=')[1] : null;
        groupId = extractGroupId(groupDescription);
    }

    if (!groupId) {
        gs.info("[Knowledge Center]: Could not find group id to unmark group as a gap");
        return false;
    }

    var result = new sn_km_gen_ai.KnowledgeGap().unmarkAsGap(groupId);
    return true;
}
