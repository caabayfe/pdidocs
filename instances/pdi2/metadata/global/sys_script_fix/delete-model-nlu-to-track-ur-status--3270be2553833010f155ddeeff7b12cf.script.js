deleteTrackURStatusModel();

function deleteTrackURStatusModel() {
    if (GlidePluginManager().isActive("com.snc.universal_request.nlu")) {
        var modelGr = new GlideRecord("sys_nlu_model");
        if (modelGr.get("95d979c253b22010b87bddeeff7b12c8")) //sys_id of NLU model: NLU to track UR status
            modelGr.deleteRecord();
    }
}
