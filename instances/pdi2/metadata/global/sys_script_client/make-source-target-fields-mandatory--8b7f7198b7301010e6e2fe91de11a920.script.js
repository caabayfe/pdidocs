
		function onLoad() {
			//Source Field, Target Field
			var singleSourceAndSingleTarget = ['sys_rte_eb_extract_numeric_operation', 'sys_rte_eb_regex_replace_operation',
				'sys_rte_eb_upper_case_trim_operation', 'sys_rte_eb_to_date_operation',
				'sys_rte_eb_replace_operation', 'sys_rte_eb_to_boolean_operation',
				'sys_rte_eb_round_numeric_operation', 'sys_rte_eb_trim_operation',
				'sys_rte_eb_to_numeric_operation', 'sys_rte_eb_upper_case_operation',
				'sys_rte_eb_script_operation' ];

			// Source Field, Target Fields
			var singleSourceAndMultiTarget = ['sys_rte_eb_split_operation', 'sys_rte_eb_copy_operation'];

			//Source Fields, Target Fields
			var multiSourceAndMultiTarget = 'sys_rte_eb_glide_lookup_operation';

			//Source Fields, Target Field
			var multiSourceAndSingleTarget = ['sys_rte_eb_multi_in_script_operation', 'sys_rte_eb_template_operation',
				'sys_rte_eb_min_max_operation', 'sys_rte_eb_concat_operation' ];

			//Target Field
			var justTarget = 'sys_rte_eb_set_operation';

			var tb = g_form.getTableName();

			if (singleSourceAndSingleTarget.indexOf(tb) >= 0) {
				makeMandatory('source_sys_rte_eb_field', 'target_sys_rte_eb_field');
				return;
			}

			if (singleSourceAndMultiTarget.indexOf(tb) >= 0) {
				makeMandatory('source_sys_rte_eb_field', 'target_sys_rte_eb_fields');
				return;
			}

			if (multiSourceAndSingleTarget.indexOf(tb) >= 0) {
				makeMandatory('source_sys_rte_eb_fields', 'target_sys_rte_eb_field');
				return;
			}

			if (tb === multiSourceAndMultiTarget) {
				makeMandatory('source_sys_rte_eb_fields', 'target_sys_rte_eb_fields');
				return;
			}

			if (tb === justTarget) {
				g_form.setMandatory('target_sys_rte_eb_field', true);
				return;
			}
		}

		function makeMandatory(sourceCol, targetCol) {
			g_form.setMandatory(sourceCol, true);
			g_form.setMandatory(targetCol, true);
		}
		
