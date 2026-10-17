function onLoad() {
    var LIST_MODEL_ID = 'c3547169534723003eddddeeff7b126c';
    var RELATED_LIST_MODEL_ID = 'd91731a9534723003eddddeeff7b121c';

    var model = g_form.getValue("model");
    if (g_form.isNewRecord() && (model === LIST_MODEL_ID || model === RELATED_LIST_MODEL_ID)) {
        g_form.removeOption('declarative_action_type', 'dispatch_action');
        g_form.removeOption('declarative_action_type', 'action_component');
    }
}
