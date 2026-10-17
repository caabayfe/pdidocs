var PDFtoTableConstants = Class.create();

PDFtoTableConstants.IMAGE_SAVE_QUALITY = 95.0;
PDFtoTableConstants.IMAGE_SAVE_FORMAT = "JPEG";
PDFtoTableConstants.MAX_NUMBER_OF_PDF_PAGES = 25.0;
PDFtoTableConstants.MAX_ATTACHMENT_SIZE = 4000000;
PDFtoTableConstants.SUPPORT_PDF_FORMAT_TYPES = ['application/pdf'];
PDFtoTableConstants.PIPELINE_NAME = gs.getProperty('sn_pdf_table_bldr.ml_pipeline_name') || "docintel_multipage_preprocessing";
PDFtoTableConstants.PIPELINE_WORKFLOW_VERSION = gs.getProperty('sn_pdf_table_bldr.ml_pipeline_workflow_version') || "1.0.0";
PDFtoTableConstants.UPDATED_PIPELINE_WORKFLOW_VERSION = new PDFtoTableOperationHelper().getUpdatedPipelineVersion();
PDFtoTableConstants.PARSER_CONFIGURATION_RECORD_LABEL = "aes_pdf_to_table_workflow_" + PDFtoTableConstants.PIPELINE_NAME + "_" + PDFtoTableConstants.UPDATED_PIPELINE_WORKFLOW_VERSION;
PDFtoTableConstants.PDF_INPUT_TABLE = 'sn_pdf_table_bldr_pdf_table_input';
PDFtoTableConstants.ATTACHMENT_HELPER = "sn_pdf_table_bldr_attachment_helper";
PDFtoTableConstants.CHUNK_SIZE = 800000;
PDFtoTableConstants.ML_CAPABILITY_DEFINITION_TABLE = "ml_capability_definition_base";
PDFtoTableConstants.USER_GUIDE_PREFERENCE_KEY = "pdf_extractor.hide_user_guide";
PDFtoTableConstants.CHOICE_INFO_PREFERENCE_KEY = "pdf_extractor.hide.add_choice_info_message";
PDFtoTableConstants.ML_DATASET_DEFINATION = {
    tableName: PDFtoTableConstants.PDF_INPUT_TABLE,
    fieldNames: ["pdf", "data", "chunk_number"],
    encodedQuery: "state=assigned"
};
PDFtoTableConstants.ERROR_NOTATION = {
    'waiting_for_training': 'waiting',
    'training_solution': 'progress',
    'uploading_solution': 'progress',
    'solution_error': 'error',
    'timed_out': 'timed_out',
    'retry': 'retry'
};
//Plugin ID of PDF Extractor plugin
PDFtoTableConstants.PDF_EXTRACTOR_PLUGIN_ID = "com.sn_pdf_to_table_builder";
//Plugin ID of Predictive Intelligence plugin
PDFtoTableConstants.PREDICTIVE_INTELLIGENCE_PLUGIN_ID = "com.glide.platform_ml";
// Plugin ID of v2 license table builder app engine name
PDFtoTableConstants.TABLE_BUILDER_APP_ENG_PLUGIN_ID = "com.devsnc_sn_tbl_bldr_appeng";

// To check property to know whether it is PDI or not
PDFtoTableConstants.SN_IS_PDI = "sn_dev_prg_pdi";

PDFtoTableConstants.prototype = {
    initialize: function() {},

    type: 'PDFtoTableConstants'
};
