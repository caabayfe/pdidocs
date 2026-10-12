function transform() {
    var LAYOUT = 'layout';
    var DICTIONARY = 'dictionary';
    var CHOICES = 'choices';
    var UI_POLICIES = 'ui_policies';
    var FLOWS = 'flows';
    var DATA_VIEWS = {
        spreadsheet: 'spreadsheet',
        schema: 'schema'
    };

    var privileges = [DATA_VIEWS.spreadsheet, DATA_VIEWS.schema];
    var gr = new GlideRecord('sys_hub_flow');

    if (gs.hasRightsTo('ui/configure.personalize_form/write', null)) {
        privileges.push(LAYOUT);
    }
    if (gs.hasRightsTo('ui/configure.personalize_dictionary/write', null)) {
        privileges.push(DICTIONARY);
    }
    if (gs.hasRightsTo('ui/configure.personalize_choices/write', null)) {
        privileges.push(CHOICES);
    }
    if (gs.hasRightsTo('ui/configure.personalize_ui_policies/write', null)) {
        privileges.push(UI_POLICIES);
    }
    if (gr.canWrite()) {
        privileges.push(FLOWS);
    }
    return privileges;
}
