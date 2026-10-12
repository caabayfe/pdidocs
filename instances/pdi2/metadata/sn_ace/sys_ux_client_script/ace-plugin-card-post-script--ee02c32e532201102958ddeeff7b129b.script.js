 // This is not a UX Client Script used by the Plugin Card, but the Post Script that must be added when creating Content Blocks (sn_ace_content_block) of Plugin Installer type 

/*
 (function(context) {

     function getPluginOrAppDetails(id, type) {
         var details = {
             name: '',
             currentVersion: '',
             newerVersion: '',
             pluginId: '',
             hasDemoData: false
         };
         if (type === 'application') {
             var grApp = new GlideRecord('sys_app_version');
             grApp.addQuery('source_app_id', id);
             grApp.query();
             if (grApp.next()) {
                 details.pluginId = id;
                 details.currentVersion = grApp.getValue('version');
                 details.newerVersion = grApp.getValue('version');
                 details.hasDemoData = grApp.getValue('demo_data');
             }

             var gr_store_app = new GlideRecord('sys_store_app');
             gr_store_app.addQuery('sys_id', id);
             gr_store_app.query();
             if (gr_store_app.next()) {
                 details.currentVersion = gr_store_app.getValue('version');
                 details.name = gr_store_app.getValue('name');
                 details.pluginId = gr_store_app.getValue('scope');

             }

             
         } else if (type === 'plugin') {
             var grPlugin = new GlideRecord('v_plugin');
             grPlugin.addQuery('id', id);
             grPlugin.query();
             if (grPlugin.next()) {
                 details.pluginId = id;
                 details.name = grPlugin.getValue('name') || id;
                 details.currentVersion = grPlugin.getValue('version');
                 details.hasDemoData = grPlugin.getValue('has_demo_data');
             }
         }
         return details;
     }

     var pluginDetails = {};

     try {

         pluginDetails = JSON.parse(context.props_details.plugins);

         var plugins = Object.keys(pluginDetails).map(function(plugin) {
             var details = getPluginOrAppDetails(plugin, pluginDetails[plugin]);
             var isInstalled = GlidePluginManager.isActive(details.pluginId);
             return {
                 id: plugin,
                 type: pluginDetails[plugin],
                 installed: isInstalled,
                 name: details.name,
                 version: details.version,
                 currentVersion: details.currentVersion,
                 newerVersion: details.newerVersion,
                 pluginId: details.pluginId,
                 hasDemoData: details.hasDemoData
             };
         });

         context.plugins = plugins;

         var progressId = context.props_details.progress_id;
         if (progressId) {
             context.status = 'installing';
         } else {
             context.status = plugins.some(function(p) {
                 return !p.installed;
             }) ? 'ready to install' : 'installed';
         }

         context.isUpdateAvailable = plugins.some(function(plugin) {
             return context.status == 'installed' && plugin.newerVersion && plugin.newerVersion != plugin.currentVersion;
         });

         if (context.props_details.action == 'update' && context.isUpdateAvailable) {
             context.status = 'ready to update';
         }

         return context;

     } catch (e) {
         gs.info('Unable to parse plugin(s) information' + e);
         return context;
     }

 })(context);

 */
