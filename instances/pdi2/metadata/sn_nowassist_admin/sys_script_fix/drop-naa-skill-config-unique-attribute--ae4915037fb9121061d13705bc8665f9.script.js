      (function() {
          try {
              var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
              var updateColumn = naaGlobalUtil.updateColumn.bind(naaGlobalUtil);
              updateColumn('sn_nowassist_skill_config_status', 'skill_config', 'unique', false);
              updateColumn('sn_ns_skill_config_ui', 'skill_config', 'unique', false);
              updateColumn('sn_ns_skill_config_var_set_ui', 'var_set', 'unique', false);
              updateColumn('sn_nowassist_skill_config', 'active', 'column_label', 'Active (Deprecated)');
              updateColumn('sn_nowassist_skill_config', 'in_product_roles', 'column_label', 'In Product Access Roles (Deprecated)');
              updateColumn('sn_nowassist_skill_config', 'in_product_active', 'column_label', 'In Product Active (Deprecated)');
          } catch (e) {
              gs.error("Updating record failed in fix Script " + e.toString());
              return null;
          }

      })();
