try {
        var HERMES_USAGE_METRICS = "hermes_usage_metrics";
        var HERMES_METRICS = "hermes_metrics";
        var SOURCE_TYPE = "source_type";
        if (gs.tableExists(HERMES_METRICS))
          updateEmptySourceTypeToAll(HERMES_METRICS);
        else
          gs.log(HERMES_METRICS + " is not available, Skipping updating source type");

        if (gs.tableExists(HERMES_USAGE_METRICS)) {
          updateEmptySourceTypeToAll(HERMES_USAGE_METRICS);
          gs.log("Aggregating all topics from " + HERMES_USAGE_METRICS);
          new sn_hermes.HermesUsageAggregator().aggregateInstanceAllTopics();
        } else
          gs.log(HERMES_USAGE_METRICS + " is not available, Skipping aggregation");
      } catch (ex) {
        gs.log("Fix script failed to aggregate all topics from " + HERMES_USAGE_METRICS + " table with exception" + ex);
    }

    /**
    * Updates all NULL values of column "source_type" to "ALL"
    */
    function updateEmptySourceTypeToAll(tableName) {
      var fExists = gs.fieldExists(tableName, SOURCE_TYPE);
      if (fExists)
        updateSourceTypeToAll(tableName);
    }

    /**
    * Updates all NULL values of column "source_type" to "ALL"
    */
    function updateSourceTypeToAll(tableName) {
      var dbu = null;
      var dbq = null;
      try {
        var dbu = new GlideDBUpdate(tableName);
        var dbq = new GlideDBQuery(tableName);
        dbq.addQuery(SOURCE_TYPE, null);
        dbu.setQuery(dbq);
        dbu.setMultiple(true);
        dbu.setValue(SOURCE_TYPE, 'ALL');
        dbu.execute();
      } catch (ex) {
        gs.log("Fix script failed to update source_type to ALL in " + tableName + " table with exception" + ex);
      } finally {
        if (dbu)
          dbu.close();
        if (dbq)
          dbq.close();
      }
    }
