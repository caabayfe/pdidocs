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
  E10:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Request DocuSign access'
    how: 'opened the item page, submitted nothing'
    result: '"* Indicates required"; Requested for filled with the employee; a Required information box beside Save as Draft and Submit lists Business justification'
  E11:
    record: sysevent_email_action/0b4ae8c0b462b410f87755e926c386c2
    field: subject
    how: read Request was opened
    result: 'Request ${number} was created'
    hash: 4408ae146a1e8b21286997ce05f2cb00d464b2dca9d0da3366db9443acdd7a09
---
Ordering takes a minute: open the item, answer its questions, order, confirm. You then get a
request number and an email, and the request appears in **My Requests**.

## Before you start

- Find the item: search for it, browse a topic, or use a quick link such as **Request Standing
  Desk** (see [Find what you need](see:find)). [E08]
- Check its **Price** and **Delivery Time** on its page. [E01]
- For a new colleague, use the **New Hire** bundle instead (see [Find what you need](see:find)).

## Order it

{{animation:reqorder}}

1. **Open the item.** Its page shows the description, the price, the **Delivery Time** and its
   questions. The *Standard Laptop*, for example, shows *$1,100.00 + $100.00 Annually*, *9 Days*,
   and asks which optional software to add and anything else you need. [E01]
2. **Answer the questions.** Required ones have a red asterisk. Until they're answered, the
   **Required information** box beside the button lists what's missing. [E10] Set **Quantity** if
   you need more than one. [E01]
3. **Press Order Now.** Some items say **Submit** or **Request** instead. [E01] [E06] There is no
   cart: each order is one item. [E02]
4. **Confirm.** The **Order Confirmation** window shows who it's for and lets you add **Delivery
   Information** and **Special Instructions**, such as the room where it should go. Confirm to
   order. [E03] [E04]

| On the item page | What it does |
|---|---|
| **Order Now** / **Submit** / **Request** | starts the order; you confirm in the next window [E04] |
| **Save as Draft** | keeps your answers under *My Requests › Drafts*, to finish later [E09] [E01] |
| the heart | adds the item to **My favorites** |

## What happens next

You land on your request's status page: its number (REQ…), what you ordered, the expected
delivery date and its stage. [E07] You also get the email *"Request REQ… was created"*. [E11] If
the item needs approval, it waits for your manager first (see [Who approves](see:approvals)).
Follow it in **My Requests**: see [Your request's statuses and emails](see:statuses).

## For someone else

At checkout you can't change who the order is for: it's for you. [E05] Items that are often for
someone else ask it as a question, such as **Requested for** on *Request DocuSign access*, already
filled with your name. [E06] [E10] Change it there before you submit.

## Tips

- Not ready? **Save as Draft**, and finish it later from **My Requests › Drafts**.
- Write useful **Special Instructions**: where to deliver, when you are in, who can receive it.
- Order one thing per request: each order is one item anyway, and each is followed on its own.

## I want to…

| I want to… | Go to |
|---|---|
| find an item | [Find what you need](see:find) |
| know what the statuses and emails mean | [Your request's statuses and emails](see:statuses) |
| add information after ordering | [Follow your request](see:follow) |
