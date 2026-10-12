(function executeRule(current) {
    var indexingComplete = true;
    var m2mGR = new GlideRecord("sn_aisearch_global_job_ingest_history");
    var indexHistoryGR = new GlideRecord("ais_ingest_datasource_stats");
    m2mGR.addQuery("sn_aisearch_global_migration_job", current.getUniqueValue());
    m2mGR.query();

    while (m2mGR.next()) {
        indexHistoryGR.get(m2mGR.getValue("ais_ingest_datasource_stats"));
        if (indexHistoryGR.getValue("state") !== "indexed")
            indexingComplete = false;
    }

    if (indexingComplete) {
        var aisAppGr = new AISMigrationUtils().getSearchProfilesToPublish(current.selected_config);
        if (aisAppGr != null) {
            var profile = aisAppGr.search_profile.name;
            var dictionaries = new AISMigrationUtils().getDictionariesToPublish(aisAppGr.search_profile);
            for (var i = 0; i < dictionaries.length; i++)
                new sn_ais.Synchronizer().publishDictionary(dictionaries[i]);

            new sn_ais.Synchronizer().publishProfile(profile);
        }
        current.setValue("state", "INDEXING_COMPLETE");
        current.update();
    }
})(current);
