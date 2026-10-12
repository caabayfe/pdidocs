var gr = new GlideRecord("vtb_card");
gr.addQuery("lane", current.lane);
gr.addQuery("removed", false);
gr.query();
if (gr.getRowCount() == current.lane.lane_wip_limit)
    true;
else
    false;
