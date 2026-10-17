function transform(input) {
			var output = new global.GlobalServiceCatalogUtil().canUseTemplate(input.templateId);
			return !output;
		}
