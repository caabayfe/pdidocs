   var log = '';
   start();

   function start() {
       log += 'EM-FixScript Start: Alert Tags Clustering Tables is going to be reparented:\n\n';
       var startTime = new Date();
       reparentAlertTagsClusteringTable();
       var endTime = new Date();
       var elapsedTime = endTime - startTime;
       log += 'Total time elapsed for reparenting Alert Tags Clustering tables in ms: ' + elapsedTime;
       gs.info(log);
       log = '';
   }

   function reparentAlertTagsClusteringTable() {
       try {

           //Reparenting new version is called "Live Reparenting" because the primary goal was to make sure it would incorporate "live" changes.
           // Dev-persistence is responsible for the new Live Reparenting.
           // Changing glide.db.table.hierarchy_editor.live to false before running the reparenting logic to use old reparenter
           log += 'Using Old reparenter to reparent the table to sys_metadata \n';
           var TABLE_HIERARCHY_EDITOR_LIVE = "glide.db.table.hierarchy_editor.live";
           var useLiveReparentingProp = gs.getProperty(TABLE_HIERARCHY_EDITOR_LIVE, "true");
           var isTableHierarchyEditorLive = useLiveReparentingProp === "true";
           if (isTableHierarchyEditorLive) {
               log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: false \n';
               GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, "false");
           }

           // reparenting the alert tags tables sn_em_tbac_alert_clustering_definitions, sn_em_tbac_alert_clustering_definitions_tags_m2m,
           // sn_em_tbac_alert_clustering_tags
           var reparentingQueue = ['sn_em_tbac_alert_clustering_definitions', 'sn_em_tbac_alert_clustering_definitions_tags_m2m', 'sn_em_tbac_alert_clustering_tags'];
           for (var i = 0; i < reparentingQueue.length; i++) {
               // reparenting only if table is not reparented
               var tableName = reparentingQueue[i];
               var gr = new GlideRecord(tableName);
               if (gr.isValid()) {
                   var tableUtils = new TableUtils(tableName);
                   var parentTables = tableUtils.getTables();
                   if (parentTables && parentTables.indexOf("sys_metadata") > -1) {
                       log += 'Abort reparenting of ' + tableName + ' table as it already extends sys_metadata.\n';
                   } else {
                       log += 'Going to reparent the alert tags clustering tables\n';
                       var changed = new GlideTableParentChange(tableName).change('', 'sys_metadata');
                       if (changed) {
                           log += 'Succeeded to reparent the ' + tableName + ' table to sys_metadata.\n';
                       } else {
                           log += 'failed to reparent the alert tags clustering tables\n';
                       }
                   }
               }
           }
       } catch (e) {
           log += 'Exception thrown during reparenting: ' + e;
       } finally {
           //setting the glide.db.table.hierarchy_editor.live value back to its original value
           if (isTableHierarchyEditorLive) {
               GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, useLiveReparentingProp);
               log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: ' + useLiveReparentingProp;
           }

       }
   }
