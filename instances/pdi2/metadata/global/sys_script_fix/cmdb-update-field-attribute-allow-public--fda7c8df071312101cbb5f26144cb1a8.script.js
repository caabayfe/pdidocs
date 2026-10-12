gs.info("Fix Script: Started CMDB Update field attribute allow_public for tables: cmdb_health_orphan_rule, cmdb_multisource_column_metadata and product_instance_identifier_parameters");

SNC.DictionaryAttribute.set('cmdb_health_orphan_rule', 'class', 'allow_public', 'true');
SNC.DictionaryAttribute.set('cmdb_multisource_column_metadata', 'table', 'allow_public', 'true');
SNC.DictionaryAttribute.set('product_instance_identifier_parameters', 'parameter_class_name', 'allow_public', 'true');

gs.info("Fix Script: Finished CMDB Update field attribute allow_public for tables: cmdb_health_orphan_rule, cmdb_multisource_column_metadata and product_instance_identifier_parameters");
