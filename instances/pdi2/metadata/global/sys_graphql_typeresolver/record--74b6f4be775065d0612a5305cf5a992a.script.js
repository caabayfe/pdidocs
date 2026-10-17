(function process( /*TypeResolutionEnvironment*/ env) {

    if (env.getObject().hasOwnProperty('value')) return 'SingleValuedField';
    if (env.getObject().hasOwnProperty('values')) return 'MultiValuedField';
    if (env.getObject().hasOwnProperty('attachmentList')) return 'AttachmentListField';

})(env);
