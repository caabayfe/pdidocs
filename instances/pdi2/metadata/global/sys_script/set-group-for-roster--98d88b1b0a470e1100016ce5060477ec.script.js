var gr = new GlideRecord("cmn_rota_roster");
if (gr.get(current.roster)) {
    current.group = gr.group;
}
