if (new GlideIndexDescriptor('cmdb_rel_ci', '', ['child', 'type']).hasIndex() || new GlideIndexDescriptor('cmdb_rel_ci', '', ['child', 'parent', 'type']).hasIndex()) {
    gs.info("Droping redundant index on cmdb_rel_ci for child ");
    new GlideIndexUtils().dropByExactElementSequence('cmdb_rel_ci', false, ['child']);
} else
    gs.info("Missing [child, type] index, skipping the drop index for cmdb_rel_ci for child");

if (new GlideIndexDescriptor('cmdb_rel_ci', '', ['parent', 'type']).hasIndex()) {
    gs.info("Dropping redundant index on cmdb_rel_ci for child ");
    new GlideIndexUtils().dropByExactElementSequence('cmdb_rel_ci', false, ['parent']);
} else
    gs.info("Missing [parent, type] index, skipping the drop index for cmdb_rel_ci for parent");
