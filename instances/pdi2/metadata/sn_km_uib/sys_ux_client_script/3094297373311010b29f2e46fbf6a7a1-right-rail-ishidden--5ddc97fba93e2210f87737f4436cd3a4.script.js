function evaluateProperty({
            api
        }) {

            const articleDetails = api.data.get_article_details_1.articleDetails;
            if (articleDetails && articleDetails.showRelatedArticles == false)
                return true;

            const relatedArticles = api.data.fetch_related_articles_1.relatedArticles;
            const { overridePageProperties, showRelatedArticles } = api.context.props;
            if (relatedArticles && relatedArticles.length > 0)
                return overridePageProperties ? !showRelatedArticles : false;

            return true;
        }
