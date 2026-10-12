gs.dropColumn('cmdb_dynamic_ire_feature', 'cmdb_class');
gs.dropColumn('cmdb_dynamic_ire_feature', 'feature');
gs.dropColumn('cmdb_dynamic_ire_feature', 'name');
gs.dropColumn('cmdb_dynamic_ire_feature', 'filter_condition_id');

gs.dropColumn('cmdb_dynamic_ire_filter_condition','description');
gs.dropColumn('cmdb_dynamic_ire_filter_condition','name');
gs.dropColumn('cmdb_dynamic_ire_filter_condition','model_id');
gs.dropColumn('cmdb_dynamic_ire_filter_condition','maximum_filtered_records');

gs.dropColumn('cmdb_dynamic_ire_model','description');
gs.dropColumn('cmdb_dynamic_ire_model','maximum_match_records');
gs.dropColumn('cmdb_dynamic_ire_model','ml_model_bias');
gs.dropColumn('cmdb_dynamic_ire_model','ml_model_class_label');
gs.dropColumn('cmdb_dynamic_ire_model','model');
gs.dropColumn('cmdb_dynamic_ire_model','precision');
gs.dropColumn('cmdb_dynamic_ire_model','version');
