if (new sn_ais.StatusApi().isAisEnabled() && gs.getProperty('glide.ais.parallel_ingestion', 'false') == 'true')
    new sn_ais.AisUtil().setParallelIngestionProcessor(1);
