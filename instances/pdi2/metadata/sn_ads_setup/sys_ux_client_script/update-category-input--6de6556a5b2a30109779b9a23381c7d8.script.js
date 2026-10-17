function handler({api, event}) { 
    //Both title and url parameters should have values or both should be empty of Article and Video 
    let isValidArticleFlag,isValidVideoFlag;
    const newCategoryInput = {
        ...api.state.categoryInput,
        article: {...api.state.categoryInput.article},
        video: {...api.state.categoryInput.video}
    };

    switch(event.elementId) {
        case 'category_name':
            newCategoryInput.name = event.payload.fieldValue;
            break;
        case 'category_rich_description':
            newCategoryInput.description = event.payload.value;
            break;
        case "category_article_title": 
            newCategoryInput.article.title = event.payload.value;
            break;
        case "category_article_url": 
            newCategoryInput.article.url = event.payload.fieldValue || "";
            newCategoryInput.article.isValid = !event.payload.value;
            break;
        case "category_video_title": 
            newCategoryInput.video.title = event.payload.value;
            break;
        case "category_video_url": 
            newCategoryInput.video.url = event.payload.fieldValue || "";
            newCategoryInput.video.isValid = !event.payload.value;
            break;
    }
    api.setState('categoryInput', newCategoryInput);
    
    if(
        !newCategoryInput.article.title &&
        !newCategoryInput.article.url
    ) {
        isValidArticleFlag = true;
    } else if(
        newCategoryInput.article.title &&
        newCategoryInput.article.url &&
        newCategoryInput.article.isValid
    ) {
        isValidArticleFlag = true;
    } else {
        isValidArticleFlag = false;
    }

    if(
        !newCategoryInput.video.title &&
        !newCategoryInput.video.url
    ) {
        isValidVideoFlag = true;
    } else if(
        newCategoryInput.video.title &&
        newCategoryInput.video.url &&
        newCategoryInput.video.isValid
    ) {
        isValidVideoFlag = true;
    } else {
        isValidVideoFlag = false;
    }

    if(
        newCategoryInput.name && 
        newCategoryInput.description && 
        isValidArticleFlag &&
        isValidVideoFlag
    ) {
        api.setState('disableCategoryPA', false);
    } else {
        api.setState('disableCategoryPA', true);
    }

 }
