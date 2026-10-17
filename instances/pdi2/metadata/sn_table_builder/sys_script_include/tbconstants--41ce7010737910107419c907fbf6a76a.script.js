var TBConstants = Class.create();

TBConstants.SYS_CLASS_DB_OBJECT = 'sys_db_object';
TBConstants.SYS_CLASS_DICTIONARY = 'sys_dictionary';
TBConstants.SYS_CLASS_UI_LIST = 'sys_ui_list';
TBConstants.SYS_CLASS_UI_LIST_ELEMENT = 'sys_ui_list_element';
TBConstants.SYS_CLASS_UI_VIEW = 'sys_ui_view';
TBConstants.SYS_CLASS_CHOICE = 'sys_choice';
TBConstants.SYS_ATTACHMENT = 'sys_attachment';

TBConstants.FIELD_CLASS_TABLE = 'sys_glide_object';
TBConstants.ADDITIONAL_INFO_TABLE = 'sn_table_builder_additional_info';
TBConstants.ATTACHMENT_HELPER = 'sn_table_builder_attachment_helper';

TBConstants.TB_PERSPECTIVES = {
	VIEW_FIELD_ROW: 'view-field-row',
};

TBConstants.CODE_404 = 404;
TBConstants.CODE_400 = 400;

TBConstants.fieldRowListView = 'tb_editor';

TBConstants.MIN_COLUMN_LENGTH = 40;

TBConstants.COLUMNS = {
	INTERNAL_TYPE: 'internal_type',
	REFERENCE: 'reference',
	DEFAULT_VALUE: 'default_value',
};

TBConstants.TYPE_STRING = 'string';
TBConstants.TYPE_REFERENCE = 'reference';
TBConstants.TYPE_CHOICE = 'choice';
TBConstants.TYPE_DEPENDENTS = {
	string: 'max_length',
	reference: 'reference',
	choice: 'choice',
};

TBConstants.DEFAULT_SCOPE = 'global';

TBConstants.prototype = {
	initialize() {},

	type: 'TBConstants',
};
