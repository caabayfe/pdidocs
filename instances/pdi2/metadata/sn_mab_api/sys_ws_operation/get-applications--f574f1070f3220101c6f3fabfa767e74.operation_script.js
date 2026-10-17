(function process(request, response) {
      var applicationService = new ApplicationService();
      return applicationService.getApplications(request.queryParams);
  })(request, response);
