# GovPay Desk — User Guide

**Adentan Municipal Education Office**

This guide explains how to use GovPay Desk to prepare, approve and record
payments. It assumes no technical knowledge. Each section covers one task.

---

## Contents

1. [What this system is for](#1-what-this-system-is-for)
2. [Signing in](#2-signing-in)
3. [Finding your way around](#3-finding-your-way-around)
4. [The life of a payment](#4-the-life-of-a-payment)
5. [Preparing a payment voucher](#5-preparing-a-payment-voucher)
6. [Attaching invoices and receipts](#6-attaching-invoices-and-receipts)
7. [Sending a voucher for approval](#7-sending-a-voucher-for-approval)
8. [Approving or returning a voucher](#8-approving-or-returning-a-voucher)
9. [Recording a payment](#9-recording-a-payment)
10. [Writing a memo](#10-writing-a-memo)
11. [Reports](#11-reports)
12. [The audit log](#12-the-audit-log)
13. [Managing staff](#13-managing-staff)
14. [Your account](#14-your-account)
15. [Common questions](#15-common-questions)

---

## 1. What this system is for

The office pays suppliers, contractors and staff. Before money leaves the
office, someone prepares a **payment voucher** describing who is being paid,
how much, and why. Someone else checks and approves it. Only then is the
payment made.

On paper, this is slow and hard to check afterwards. Vouchers go missing.
Nobody can say for certain who approved what, or when.

GovPay Desk does the same job on screen. It keeps the record of every step
automatically, so at the end of the year the office can show exactly what was
paid, who approved it, and what evidence supports it.

**Three rules the system will not let you break:**

- The person who prepares a voucher cannot approve their own voucher.
- A voucher that has been approved or paid cannot be edited.
- Nobody can approve a payment larger than the limit set for them.

These are not suggestions. The system refuses.

---

## 2. Signing in

1. Open the web address your administrator gave you.
2. Type your email address and password.
3. Select **Log in**.

If you get the password wrong five times, the system stops accepting attempts
for a minute. This protects the office against someone guessing passwords.

**Forgotten your password?** Select **Forgot password** on the sign-in page and
follow the emailed link.

**Two-step sign-in.** You can add a second step using an app on your phone.
Go to **Settings → Two-Factor Auth**. Once switched on, you enter a six-digit
code from your phone each time you sign in. This is recommended for anyone who
approves payments.

---

## 3. Finding your way around

**The menu on the left** is grouped by what you are doing:

| Group | What is in it |
|---|---|
| **Payments** | The dashboard, payment vouchers, the approval queue, memos |
| **Records** | Supporting documents, ledger transactions, chart of accounts, reports |
| **Administration** | Departments, staff, roles, audit log — administrators only |

If you do not see the Administration group, you are not an administrator. That
is normal.

**The bar at the top** has:

- the **bell**, showing anything waiting for you — a red number means unread
- **Quick Actions**, to start a new voucher or memo from anywhere
- a **light and dark** switch

On a phone, the menu is behind the button at the top left.

---

## 4. The life of a payment

Every payment moves through the same stages, in order:

```
   Draft  →  Awaiting approval  →  Approved  →  Paid  →  Memo filed
                     │
                     └──→  Returned  (comes back to you to correct)
```

| Stage | What it means | Who acts next |
|---|---|---|
| **Draft** | Being prepared. Nobody else has seen it. | You — finish and submit it |
| **Awaiting approval** | Submitted. Waiting for a decision. | An approver |
| **Returned** | Sent back with a reason. Can be edited. | You — correct and resubmit |
| **Approved** | Cleared for payment. | The accountant |
| **Paid** | Money released. Recorded in the ledger. | Optionally raise a memo |

The dashboard shows how many vouchers sit at each stage.

---

## 5. Preparing a payment voucher

**Who can do this:** Finance Officers and Administrators.

1. Select **Quick Actions → Create voucher**, or go to **Payment vouchers** and
   select **New payment voucher**.
2. Fill in the form. Fields marked with a red asterisk are required.

**What each field means:**

| Field | What to put |
|---|---|
| Voucher date | The date of the payment request |
| Department | Which department the money comes from |
| Payee name | Exactly who is being paid, as on the invoice |
| Payee bank and account | Where the money is going, for a transfer |
| Amount | In Ghana cedis |
| Payment method | Cheque, bank transfer, or cash |
| Cheque number | Required if you chose cheque |
| Description | What the money is for, in plain words |
| Budget line | Which budget the spending comes out of |

3. Select **Create Payment Voucher**.

The voucher is saved as a **draft**. It has a number like `PV-2026-014`. Nobody
else sees it until you submit it.

### Checks while you type

As you fill in the form, the system quietly compares what you have entered
against past payments. If something looks unusual, a yellow box appears:

- **Possible duplicate** — the same payee was paid the same amount recently.
  Check you are not paying an invoice twice.
- **Unusually large** — the amount is far above what this department normally
  pays. Check the figure.
- **Budget line may be wrong** — your description mentions fuel but the budget
  line says office supplies, for example.

**These are warnings, not errors.** Every one of them can be perfectly correct.
You can still save the voucher. The system is pointing something out, not
refusing.

The system may also suggest a budget line based on your description. Select the
suggestion to use it, or ignore it.

---

## 6. Attaching invoices and receipts

Open a draft or returned voucher and select **Attach a file** under *Supporting
documents*.

- Accepted: PDF, JPG, PNG, Word, Excel
- Largest size: 10MB

Attach the supplier's invoice before submitting. Approvers frequently return
vouchers for missing invoices, and this is the most common reason for delay.

Once a voucher is approved or paid, its documents can no longer be removed.
They are part of the financial record.

---

## 7. Sending a voucher for approval

From the **Payment vouchers** list, select **Submit** on a draft.

The system works out who should approve it, based on the amount:

| Amount | Approval level |
|---|---|
| Up to GHS 5,000 | Level 1 — Routine |
| Up to GHS 50,000 | Level 2 — Standard |
| Up to GHS 250,000 | Level 3 — Senior |
| Above GHS 250,000 | Level 4 — Executive |

Only approvers whose limit covers the amount are notified. A GHS 300,000
payment does not appear in a junior officer's queue.

Once submitted, you cannot edit the voucher. If you need to change something,
ask an approver to return it.

---

## 8. Approving or returning a voucher

**Who can do this:** Approvers and Administrators.

Go to **Awaiting approval**. Each voucher shows the payee, the amount, the
department, who prepared it, and how long it has been waiting. Anything waiting
three days or more is marked in red.

**Before deciding, look at:**

- **Yellow warning boxes** — automatic checks that flagged something
- **The approval band** — which level this amount falls into
- **Supporting documents** — is the invoice attached?

### Asking the AI for a second opinion

Select **AI review**. The system sends the voucher and the department's recent
payment history to Claude, an AI service, and shows back:

- a risk level — low, medium or high
- one sentence summarising the position
- specific things to check

**This is advice, not a decision.** The AI cannot approve or reject anything.
It has no authority over the payment. You decide, and the record shows that you
decided. If the AI is unavailable, the button says so and you carry on as
normal.

### Approving

Select **Approve** and confirm. The voucher moves to *Approved* and the
preparer is notified.

If **Approve** is greyed out, either you prepared this voucher yourself, or the
amount is above your limit. The reason is shown on screen.

### Returning a voucher

Select **Return**, then write what needs correcting. Be specific — the preparer
sees exactly what you write, and a vague reason means another round trip.

Good: *"The supplier invoice is not attached and the quantities do not match
the requisition."*

Not useful: *"Incorrect."*

---

## 9. Recording a payment

**Who can do this:** Finance Officers and Administrators.

Once the money has actually left the office, find the approved voucher and
select **Mark as paid**.

The system then records the payment in the ledger automatically, as a pair of
matching entries:

- the expense is charged to the right budget account
- cash or bank is reduced by the same amount

You do not do anything for this to happen. You can see the result under
**Records → Transactions**. Total debits and total credits always match; if
they ever did not, the page would say so in red.

---

## 10. Writing a memo

A memo is a short internal note recording that a payment was made, for the
file.

1. Go to **Memos → New memo**.
2. Choose the paid voucher the memo is about.
3. Fill in the subject, who it is to, who it is from, and the body.
4. Select **Create memo**.

### Letting the AI write the first draft

Select **Draft with AI**. The system writes a subject and body from the
voucher's details and puts them in the form.

**Read it before saving.** It is a starting point that saves typing, not a
finished document. You can change every word, and nothing is saved until you
select **Create memo**.

### Finishing a memo

- **Finalize** — the memo is complete. It can no longer be edited.
- **Mark printed** — a paper copy has been printed and filed.

---

## 11. Reports

Under **Records → Reports**:

- **By month** — what was paid each month, with a total for the year
- **By department** — what each department spent, largest first

Both cover **paid** vouchers only. Money that has been approved but not yet
released is not spending yet.

Use the year selector at the top right to look at a different year.

**Print report** opens a clean version and your printer dialogue. To save a PDF
instead of printing, choose "Save as PDF" as the destination.

Every time a report is printed, the system records who did it and when. This is
deliberate — reports leave the office as evidence.

The dashboard also shows two charts: spending per month over the last year, and
spending per department this year.

---

## 12. The audit log

**Who can see it:** Administrators only.

**Administration → Audit log** lists every action taken in the system: who did
it, what they did, when, and from which computer.

Nothing in the system can change or delete an entry. This is the record an
auditor relies on, so it only ever grows.

You can filter by action type or search the descriptions.

---

## 13. Managing staff

**Who can do this:** Administrators only.

**Administration → Staff** lists everyone with access.

### The four roles

| Role | What they can do |
|---|---|
| **Administrator** | Everything, including managing staff and reading the audit log |
| **Approver** | Approve or return vouchers, up to their limit |
| **Finance Officer** | Prepare vouchers, attach documents, record payments |
| **Viewer** | Read only. Cannot create or change anything. |

### Adding someone

Select **Add user**, fill in their details, and choose a role. If you choose
Approver, set their **approval limit** — the largest payment they may release.
Leave it blank for no limit.

New accounts start with the password `password`. Tell the person to change it
immediately under **Settings → Password**.

### When someone leaves

Edit their account and switch **Active** off. They are signed out straight away
and cannot sign back in. Their past vouchers and audit entries stay intact —
the record of what they did must not disappear.

You cannot remove your own administrator role. This stops the office
accidentally locking itself out.

---

## 14. Your account

Under **Settings**:

- **Profile** — your name, email and phone
- **Password** — change your password
- **Two-Factor Auth** — add the second sign-in step

---

## 15. Common questions

**I cannot edit my voucher.**
It has been submitted. Only drafts and returned vouchers can be edited. Ask an
approver to return it.

**The Approve button is greyed out.**
Either you prepared it — the same person cannot prepare and approve — or the
amount is above your limit. The reason is on screen.

**I got a warning but the payment is correct.**
Save it anyway. The warnings point things out; they do not block you. The
approver sees the same warning and can judge for themselves.

**The AI review is not working.**
The office may not have it switched on, or the service may be briefly
unavailable. Approve or return using your own judgement — nothing else changes.

**I paid the wrong voucher.**
Payments cannot be reversed in the system. Speak to your administrator; the
correction is an accounting matter, and the audit log preserves what happened.

**Someone has left. Should I delete their account?**
No. Switch **Active** off instead. Deleting would break the record of what they
approved.

**I cannot see the Administration menu.**
You are not an administrator. Ask one if you need something from it.

---

*GovPay Desk — Adentan Municipal Education Office*
