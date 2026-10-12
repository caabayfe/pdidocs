(function executeRule(current, previous /*null when async*/ ) {
    var composition = [];
    var data = [];
    var internal_event_mappings = [];

    try {
        composition = current.composition ? JSON.parse(current.composition) : [];
        data = current.data ? JSON.parse(current.data) : []; // edge case for TRANSLATE transform scripts
        internal_event_mappings = current.internal_event_mappings ? JSON.parse(current.internal_event_mappings) : [];
    } catch (e) {
        gs.warn("Unable to parse JSON as part of UXF macroponent translation extraction", e);
    }

    var input = JSON.stringify([composition, data, internal_event_mappings]);
    current.required_translations = UxFrameworkScriptables.extractTranslations(input);
})(current, previous);
