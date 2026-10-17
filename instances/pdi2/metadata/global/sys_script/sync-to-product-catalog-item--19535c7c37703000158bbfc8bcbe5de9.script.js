if (current.model.sys_class_name == 'cmdb_hardware_product_model' || current.model.sys_class_name == 'cmdb_consumable_product_model') {
    if (current.product_catalog_item.vendor_catalog_item == current.sys_id)
        (new ProductCatalogUtils()).updateProductCatalog(current, 'vendor', 'pc_hardware_cat_item');
}
