if (current.sys_class_name == 'cmdb_hardware_product_model' || current.sys_class_name == 'cmdb_consumable_product_model')
    (new ProductCatalogUtils()).updateProductCatalog(current, 'model', 'pc_hardware_cat_item');
else if (current.sys_class_name == 'cmdb_software_product_model')
    (new ProductCatalogUtils()).updateProductCatalog(current, 'model', 'pc_software_cat_item');
else if ((GlideDBObjectManager.get().getBase(current.getTableName()) != 'cmdb_serviceorder_product_model') && (GlideDBObjectManager.get().getBase(current.getTableName()) != 'cmdb_servicetask_product_model'))
    (new ProductCatalogUtils()).updateProductCatalog(current, 'model', 'pc_product_cat_item');
