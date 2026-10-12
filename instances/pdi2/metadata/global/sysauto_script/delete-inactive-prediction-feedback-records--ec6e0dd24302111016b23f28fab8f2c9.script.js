var fbGr = new GlideRecord(MLBaseConstants.FEEDBACK_TABLE);
fbGr.addQuery('active', false);
fbGr.query();

fbGr.deleteMultiple();
