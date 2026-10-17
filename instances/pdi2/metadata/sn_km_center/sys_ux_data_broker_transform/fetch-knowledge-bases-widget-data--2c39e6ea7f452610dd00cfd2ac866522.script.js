function transform() {
      var kbPortal = new global.KBPortalServiceImpl();
      var bases = kbPortal.getMyKnowledgeBases();
      return bases;
}
