// Start deleting in reverse order. 1. Nodes, 2. Layers and 3. Portfolio

var nodes = new GlideRecord('spm_taxonomy_node');
nodes.addQuery('spm_service_portfolio', current.getUniqueValue());
nodes.setWorkflow(false);
nodes.deleteMultiple();

var layers = new GlideRecord('spm_taxonomy_layer_definition');
layers.addQuery('spm_service_portfolio', current.getUniqueValue());
layers.setWorkflow(false);
layers.deleteMultiple();

var portfolio = new GlideRecord('spm_service_portfolio');
portfolio.get(current.getUniqueValue());
portfolio.setWorkflow(false);
portfolio.deleteRecord();

gs.info("Portfolio and taxonomy layers and nodes are deleted");
