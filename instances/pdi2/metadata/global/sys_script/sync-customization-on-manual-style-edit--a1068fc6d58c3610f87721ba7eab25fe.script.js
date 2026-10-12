(function executeRule(current, previous /*null when async*/) {
			// Verifying if the request is made from theme builder
			const glideTransactionRequest = GlideTransaction.get().getRequest();
			if (glideTransactionRequest) {
				const glideTransactionRequestHeader = glideTransactionRequest.getHeader("referer");
				if (glideTransactionRequestHeader && glideTransactionRequestHeader.includes('theme-builder')){
					return;
				}
			}
			var updateCustomizationTBUtils = new sn_theme_builder.ThemeBuilderBiDirectionalUpdateUtils();
			updateCustomizationTBUtils.handleBidirectionalUpdate(current, previous);
		})(current, previous);
