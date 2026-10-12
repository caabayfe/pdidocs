
    updateAisSearchSourceToAisDatasoureReference();

    function updateAisSearchSourceToAisDatasoureReference() {
      var glideRecord = new GlideRecord("sys_dictionary");
      glideRecord.addQuery("element", "datasource");
      glideRecord.addQuery("name", "ais_search_source");
      glideRecord.query();

      if(!glideRecord.next()){
        return;
      }

      glideRecord.setValue("reference_qual", "active=true^EQ");
      glideRecord.update();
    }
