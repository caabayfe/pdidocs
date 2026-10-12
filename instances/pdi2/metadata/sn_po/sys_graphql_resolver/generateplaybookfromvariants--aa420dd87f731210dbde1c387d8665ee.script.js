(function process(/*ResolverEnvironment*/ env) {

    var params = {
        "projectId": env.getArguments()['projectId'],
        "playbookLabel": env.getArguments()['playbookLabel'],
        "prompt": env.getArguments()['prompt'],
        "variants": env.getArguments()['variants']
    };
    return new sn_po.ProminPlaybookUtil().generatePlaybookFromVariants(params);

})(env);
