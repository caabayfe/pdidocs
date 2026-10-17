
	    async function handler({api, event, helpers, imports}) {
	    const createArticleTooltip = await helpers.translate("Create article");
	    api.setState("createArticleTooltip", createArticleTooltip);
	}
