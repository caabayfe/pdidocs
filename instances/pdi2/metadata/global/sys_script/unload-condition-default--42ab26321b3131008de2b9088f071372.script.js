// Optionally save wf_condition_default depending on what kind of wf_element_definition it is.
if (isMemberOfLegacyActivity())
    gs.updateSave(current);

function isMemberOfLegacyActivity() {
	var gr = new GlideRecord('wf_activity_definition');
	return gr.get(current.activity_definition);
}
