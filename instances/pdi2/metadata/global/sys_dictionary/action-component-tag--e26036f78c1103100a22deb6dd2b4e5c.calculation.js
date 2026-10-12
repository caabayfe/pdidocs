(function calculatedFieldValue(current) {var gr = new GlideRecord('sys_ux_lib_component'); if (gr.get(current.action_component)) return gr.getValue('tag'); return '';})(current);
