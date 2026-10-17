function transform(input) {
    var inputBusinessObjectiveId = input.business_objective_id;
    var inputApplicationId = input.application_id;

    var headerUtil = new AdminCenterUtil();

    var content = {
        businessObjectiveData: headerUtil.getBusinessObjectiveData(inputBusinessObjectiveId),
        applicationData: headerUtil.getApplicationData(inputApplicationId)
    };

    var breadcrumb = [headerUtil.generateItsmBusinessObjectivesBreadcrumbItem()];
    if (inputBusinessObjectiveId) {
        breadcrumb.push(headerUtil.generateBusinessObjectiveDetailsBreadcrumbItem(inputBusinessObjectiveId));
        if (inputApplicationId) {
            breadcrumb.push(headerUtil.generateApplicationDetailsBreadcrumbItem(inputBusinessObjectiveId, inputApplicationId));
        }
    }

    return {
        content: content,
        breadcrumb: breadcrumb,
        copyLink: headerUtil.generatePageURL(input.page_path)
    };
}
