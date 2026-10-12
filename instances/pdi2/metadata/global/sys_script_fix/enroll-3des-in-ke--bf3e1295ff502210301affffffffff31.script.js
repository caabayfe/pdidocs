(function() {
    var pluginManager = new GlidePluginManager();
    // Ignore if its zboot.
    if (pluginManager.isZboot())
        return;

    var tableName = 'sys_kmf_module_crypto_spec';
    if (!GlideTableDescriptor.isValid(tableName)) {
        gs.info('Table {0} is not valid', tableName);
        return;
    }

    var dbQuery;
    var dbUpdate;
    try {
        dbQuery = new GlideDBQuery(tableName);
        dbUpdate = new GlideDBUpdate(tableName);
        dbQuery.addQuery('crypto_module', '7d7ee9e3b7030010ebf7082e7e11a979');
        dbQuery.addQuery('algorithm.algorithm', 'DESede');
        dbQuery.addQuery('key_type.type_id', 'sym_data_enc');
        dbUpdate.setQuery(dbQuery);
        dbUpdate.setValue('enroll_module_for_resource_exchange', 'true');
        dbUpdate.execute();
        gs.info('Successfully enrolled the 3DES spec in KE');
    } catch (e) {
        gs.error('Error while enrolling the 3DES spec in KE', e);
    } finally {
        if (dbUpdate)
            dbUpdate.close();

        if (dbQuery)
            dbQuery.close();
    }
    // Finally generate the KE request templates.
    new SNC.KMFAutoKeyExchangeRequestGeneratorAPI().generateAutoKeyExchangeRequests();
})();
