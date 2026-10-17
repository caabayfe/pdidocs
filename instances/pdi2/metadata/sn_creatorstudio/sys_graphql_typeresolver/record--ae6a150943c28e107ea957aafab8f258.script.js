(function process(env) {
   return 'errorType' in env.getObject() ? 'Error' : 'Topics';
})(env);
