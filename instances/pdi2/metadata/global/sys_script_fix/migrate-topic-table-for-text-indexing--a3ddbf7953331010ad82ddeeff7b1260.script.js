new GlideTSUtil().addTableToMigrationList('sys_cs_topic');
new GlideTextIndexEvent().migrateTable('sys_cs_topic', null);
