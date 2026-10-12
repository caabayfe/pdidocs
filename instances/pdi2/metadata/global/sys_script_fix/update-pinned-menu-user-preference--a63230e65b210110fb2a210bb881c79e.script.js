(function() {
    var fixMap = {
        "all": "d6e462a5c3533010cbd77096e940dd8c",
        "workspaces": "63242b61c3133010cbd77096e940dd23",
        "favorites": "1b682fe1c3133010cbd77096e940dd18",
        "history": "c51543a5c3133010cbd77096e940dd43",
        "f15a7264c320011001dd7096e940dd37": "1b682fe1c3133010cbd77096e940dd18",
        "605a7264c320011001dd7096e940ddd2": "c51543a5c3133010cbd77096e940dd43",
        "535a3264c320011001dd7096e940ddae": "63242b61c3133010cbd77096e940dd23"
    };

    var gr = new GlideRecord("sys_user_preference");
    gr.addQuery("name", "glide.ui.menu.main.pinned.id");
    gr.query();

    while (gr.next()) {
        var key = gr.getValue("value");
        if (key !== null && fixMap[key] !== undefined) {
            gr.value = fixMap[key];
            gr.update();
        }
    }
})();
