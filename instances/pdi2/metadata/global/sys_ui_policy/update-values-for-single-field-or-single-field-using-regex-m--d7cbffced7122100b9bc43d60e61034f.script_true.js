function onCondition() {
    var embeddedList = $$('div[tab_list_name_raw="em_mapping_rule.em_mapping_pair.mapping_rule"]')[0];
    if (embeddedList && embeddedList.hasClassName && embeddedList.hasClassName('embedded')) {
        embeddedList.show();
    }
}
