---
title: Order something
reviewed: 2026-10-17
evidence:
  E01:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › Standard Laptop'
    how: 'opened the item page'
    result: 'Quantity, Price $1,100.00 + $100.00 Annually, Delivery Time 9 Days, Save as Draft, Order Now; questions Optional Software (Adobe Acrobat, Adobe Photoshop), Additional software requirements; no Add to Cart'
  E02:
    record: sp_instance/817b06d373a75300c629e1e54cf6a74e
    field: widget_parameters
    how: read the catalog item widget on Employee Center
    result: show_add_cart_button false
    hash: fb48877644c0be832f8a44ea6dbc8c18ddbadf65938aac23c623be497a96e9d0
  E03:
    record: sp_widget/1efb954a7f900300688e91679ffa91f8
    field: template
    how: read Catalog Checkout
    result: 'Order Confirmation, with Request For, Delivery Information and Special Instructions'
    hash: e52ff2687fdd247bf1e571d35df58c95c20288a34113353fd38103dc9af050e6
  E04:
    record: sys_properties/5782820e87321300e0ef0cf888cb0b65
    field: value
    how: read glide.sc.sp.twostep
    result: true; the portal asks for confirmation before ordering
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E05:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'System Properties, glide.sc.req_for'
    how: 'read the values'
    result: 'glide.sc.req_for.roles is empty and glide.sc.req_for.roles.default is deny'
  E06:
    record: sc_cat_item/b2168e1847520950f53d37d2846d434f
    how: read Request DocuSign access
    result: request method submit; asks Requested for and a mandatory Business justification
    hash: 7cf05bb7822fd741b23584bb79dfdcff157d212042f2628128c841f457402baf
  E07:
    record: sp_page/b28ba88e9f4332002528d4b4232e70d1
    how: read the order status page
    result: request number, summary, delivery date, stage, View Details
    hash: e5036ec9b4618692b775ceb864d033c355b1731e5c52094b22ec7e160154b025
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center home › Quick links'
    how: 'followed Request Standing Desk'
    result: 'opens the catalog item Desk Set Up'
  E09:
    record: sys_properties/9f6e1d7aeb023110e466c278495228d1
    field: value
    how: read glide.sc.enable.save_as_draft.portal.esc
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## Find the item

Search Employee Center for what you need (*laptop*, *Adobe*, *access*), or browse the topics on the
home page. Some common items have a quick link, such as **Request Standing Desk**. [E08]

## Order it

The item's page shows its price, the **Delivery Time** and its questions. For the *Standard
Laptop*, for example: optional software to add, and anything else you need. [E01]

1. Answer the questions; set **Quantity** if you need more than one.
2. Press **Order Now** (some items say **Submit** or **Request**). [E01] [E06] There is no cart:
   each order is one item. [E02]
3. Confirm in **Order Confirmation**; add delivery details or special instructions if useful.
   [E03] [E04]

**Save as Draft** keeps it under *My Requests › Drafts* to finish later. [E09] [E01]

You land on your request's status: its number (REQ…), what you ordered, the expected delivery and
its stage. [E07]

## For someone else

At checkout you can't change who the order is for. [E05] Items that are often for someone else
ask for it as a question, such as **Requested for** on access requests. [E06]
