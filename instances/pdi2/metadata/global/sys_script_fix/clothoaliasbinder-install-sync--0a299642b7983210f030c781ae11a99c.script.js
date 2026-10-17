// Clotho alias/credential seeding on install/upgrade (inline only).
// Requires Script Include: ClothoAliasBinder (with .syncAll()).

(function () {
  gs.log("Clotho fix: binder sync start");
  try {
    new ClothoAliasBinder().syncAll();
    gs.log("Clotho fix: binder sync done");
  } catch (e) {
    gs.error("Clotho fix: binder sync failed: " + e.message);
  }
})();
