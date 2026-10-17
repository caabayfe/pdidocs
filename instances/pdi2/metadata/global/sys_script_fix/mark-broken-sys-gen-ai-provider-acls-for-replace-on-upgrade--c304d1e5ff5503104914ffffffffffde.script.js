// Sets replace_on_upgrade=true on sys_update_xml rows for the broken sys_gen_ai_provider ACLs
// (matched by name only). A name is only updated when BOTH conditions hold:
//   1) the sys_update_xml row was last updated by 'system' (sys_updated_by == 'system'), AND
//   2) EVERY matching sys_update_version came from a system-generated source
//      ("System Upgrades" or "Update Set: Default").
// If the row was last updated by another user, or any version came from another source,
// the record was customized and is left untouched. Only sys_update_xml is modified.
(function executeFix() {
      var LOG = 'GenAIProviderAclCleanup: ';

      // Sources considered system-generated / safe to clean up.
      var ALLOWED_SOURCES = ['System Upgrades', 'Update Set: Default'];

      var UPDATE_NAMES = [
          'sys_security_acl_173f8eadfff166100158ffffffffff4b', // read
          'sys_security_acl_573f8eadfff166100158ffffffffff52', // write
          'sys_security_acl_5f3f8eadfff166100158ffffffffff40', // create
          'sys_security_acl_973f8eadfff166100158ffffffffff59'  // delete
      ];

      // True only if EVERY sys_update_version for this name came from an allowed source.
      function allVersionsAreSystemGenerated(name) {
          var ver = new GlideRecord('sys_update_version');
          ver.addQuery('name', name);
          ver.query();
          while (ver.next()) {
              var source = ver.getDisplayValue('source') || ver.getValue('source') || '';
              var allowed = ALLOWED_SOURCES.some(function(s) { return source.indexOf(s) !== -1; });
              if (!allowed) {
                  gs.info(LOG + name + ': disallowed source "' + source + '" -> skip');
                  return false;
              }
          }
          return true;
      }

      var updated = 0, skipped = 0;

      UPDATE_NAMES.forEach(function(name) {
          // Find all sys_update_xml rows for this name.
          var ux = new GlideRecord('sys_update_xml');
          ux.addQuery('name', name);
          ux.query();

          if (!ux.hasNext()) {
              gs.info(LOG + name + ': no sys_update_xml row -> skip');
              skipped++;
              return;
          }

          // Gate 1: EVERY row for this name must be last updated by 'system'.
          // If any row was touched by another user, skip the whole name (update nothing).
          var allUpdatedBySystem = true;
          while (ux.next()) {
              if (ux.getValue('sys_updated_by') != 'system') {
                  gs.info(LOG + name + ': sys_updated_by="' + ux.getValue('sys_updated_by') +
                      '" (not system) -> skip name');
                  allUpdatedBySystem = false;
                  break;
              }
          }
          if (!allUpdatedBySystem) {
              skipped++;
              return;
          }

          // Gate 2: every sys_update_version for this name must come from a system-generated source.
          if (!allVersionsAreSystemGenerated(name)) {
              skipped++;
              return;
          }

          // Both gates passed -> set replace_on_upgrade=true on all sys_update_xml row(s) for this name.
          ux.query(); // re-run the same query (name condition still set) to reset the cursor
          while (ux.next()) {
              ux.setValue('replace_on_upgrade', true);
              ux.update();
              gs.info(LOG + 'Set replace_on_upgrade=true on sys_update_xml: name=' + ux.getValue('name') +
                  ', action=' + ux.getValue('action') +
                  ', target_name=' + ux.getValue('target_name') +
                  ', type=' + ux.getValue('type') +
                  ', sys_id=' + ux.getUniqueValue());
              updated++;
          }
      });

      gs.info(LOG + 'DONE. sys_update_xml updated (replace_on_upgrade=true)=' + updated + ', skipped=' + skipped);
  })();
