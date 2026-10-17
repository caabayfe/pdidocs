(function process( /*ResolverEnvironment*/ env) {
    var args = env.getArguments();
    var service = new FavoritesService();
    return service.createFavorite(args);
})(env);
