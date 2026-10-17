gs.log('Starting m2m_dictionary_dataclass reparenting');
var reparenter = new GlideTableParentChange("m2m_dictionary_dataclass");
reparenter.change('', 'sys_metadata');
gs.log('Finished m2m_dictionary_dataclass reparenting');
