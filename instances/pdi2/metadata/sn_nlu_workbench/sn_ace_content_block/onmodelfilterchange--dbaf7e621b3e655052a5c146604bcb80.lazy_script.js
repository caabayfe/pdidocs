(function(context, pageParams, blockcontext) {

    var currentTab = blockcontext.currentTab,
        vaRowDefinition = blockcontext.vaRowDefinition,
        vaTotalRecords = blockcontext.vaTotalRecords,
        iarRowDefinition = blockcontext.iarRowDefinition,
        iarTotalRecords = blockcontext.iarTotalRecords,
        aisRowDefinition = blockcontext.aisRowDefinition,
        aisTotalRecords = blockcontext.aisTotalRecords;

    var filter = {};
    var PAGE_SIZE = 10;
    var modelListUtil = new sn_nlu_workbench.NLUModelList();
	var isInvokedFromRW = blockcontext.isInvokedFromRW;

    if (currentTab == 'virtual_agent' || isInvokedFromRW) {
        filter.searchText = blockcontext.vaSearchText || "";
        filter.isOOB = blockcontext.vaIsOOB || false;
        filter.language = blockcontext.vaLanguageFilter;
        var vaPageNumer = ((filter.searchText || filter.isOOB || filter.language) && vaTotalRecords <= PAGE_SIZE) ? 0 : blockcontext.vaPageNumber;
        var vaRowDefinitionData = modelListUtil.getRowDefinition('virtual_agent', filter, vaPageNumer);
        vaRowDefinition = vaRowDefinitionData.rowDefinition;
        vaTotalRecords = vaRowDefinitionData.totalRecords;
    }

    if (currentTab == 'issue_auto_resolution' || isInvokedFromRW) {
        filter.searchText = blockcontext.iarSearchText || "";
        filter.isOOB = blockcontext.iarIsOOB;
        var iarPageNumer = ((filter.searchText || filter.isOOB) && iarTotalRecords <= PAGE_SIZE) ? 0 : blockcontext.iarPageNumber;
        var iarRowDefinitionData = modelListUtil.getRowDefinition('issue_auto_resolution', filter, iarPageNumer);
        iarRowDefinition = iarRowDefinitionData.rowDefinition;
        iarTotalRecords = iarRowDefinitionData.totalRecords;
    }

    if (currentTab == 'search' || isInvokedFromRW) {
        filter.searchText = blockcontext.aisSearchText || "";
        filter.isOOB = blockcontext.aisIsOOB;
        filter.language = blockcontext.aisLanguageFilter;
        var aisPageNumer = ((filter.searchText || filter.isOOB || filter.language) && aisTotalRecords <= PAGE_SIZE) ? 0 : blockcontext.aisPageNumber;
        var aisRowDefinitionData = modelListUtil.getRowDefinition('search', filter, aisPageNumer);
        aisRowDefinition = aisRowDefinitionData.rowDefinition;
        aisTotalRecords = aisRowDefinitionData.totalRecords;
    }

    return {
        vaRowDefinition: vaRowDefinition,
        vaTotalRecords: vaTotalRecords,

        iarRowDefinition: iarRowDefinition,
        iarTotalRecords: iarTotalRecords,

        aisRowDefinition: aisRowDefinition,
        aisTotalRecords: aisTotalRecords,

        overlayDefinition: {},
        isInvokedFromRW: false
    };
})(context, pageParams, blockcontext);
