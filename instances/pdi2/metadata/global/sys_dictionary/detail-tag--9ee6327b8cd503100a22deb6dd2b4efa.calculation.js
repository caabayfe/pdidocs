(function calculatedFieldValue(current) {var gr = new GlideRecord('sys_ux_page_element'); if (gr.get(current.detail)) return gr.getValue('tag'); return '';})(current);
