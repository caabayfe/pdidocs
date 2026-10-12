// set the "Is Metadata Updated" flag to true. scheduled job will look at this flag and sends the metadata to Mosaic
gs.info('Mosaic: in Set Mosaic metadata flag - plugin install');
sn_one_extend.GenerativeAIUtility.setIsMetadataUpdatedFlag('', '');
