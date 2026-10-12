function onLoad() {
    g_form.getReference('datasource', showLink);
}

function showLink(datasource) {
    if (datasource.type != 'external') {
		g_form.addInfoMessage(new GwtMessage().getMessage('Matches {0} records (Click to <a href="/nav_to.do?uri=/{1}_list.do?sysparm_query={2}" target="_preview">preview</a>)', g_scratchpad.recordCount, g_form.getValue("datasource"), g_scratchpad.adjustedCondition));
    }
}
