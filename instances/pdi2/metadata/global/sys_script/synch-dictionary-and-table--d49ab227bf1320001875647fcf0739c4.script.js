//For tables that aren't virtual
SNC.TableEditor.tableCreate(current.name, current.label, current.super_class, current.sys_scope, current.extension_model);
// reset current.label to actual label of table so the customer update gets generated correctly
current.label = GlideTableDescriptor.get(current.name).getLabel();
