# Night Differential Platform --- Documentation

## Purpose

This documentation defines a small employee-only web application for
tracking and computing Night Differential (ND) for a group of
colleagues/workmates.

The application is **not** intended to be a company payroll system.

It is a personal/team tracking and computation tool whose main workflow
is:

> Enter shift → calculate ND → determine applicable wage type code(s) →
> save record → track totals.

## Scope

### Included

-   Employee login/profile
-   Shift entry
-   Overnight shift handling
-   10:00 PM--6:00 AM ND window
-   Default 1-hour unpaid break
-   Simple "Break included in ND?" option
-   Per-shift day classification
-   Rotational schedules
-   Holiday calendar
-   ADP wage type lookup
-   Multiple applicable wage type results
-   ND records/history
-   Payroll-period summaries
-   Estimated ND amount

### Excluded

-   Manager accounts
-   Admin accounts
-   Manager approval workflow
-   Company-wide payroll processing
-   Fixed Saturday/Sunday rest-day assumptions
-   Break start/end entry
-   Full employee scheduling system

## Documentation Map

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `01-BUSINESS-RULES.md`              Core ND rules and confirmed
                                      assumptions

  `02-WAGE-TYPES.md`                  ADP wage type codes and
                                      configuration

  `03-CALCULATION-ENGINE.md`          Calculation logic and decision flow

  `04-DATA-MODEL.md`                  Database tables and relationships

  `05-USER-INTERFACE.md`              Screens and employee workflow

  `06-IMPLEMENTATION-PLAN.md`         Recommended development order and
                                      testing

  `07-SETUP-PLAN.md`                  Application foundation: stack,
                                      file structure, design system,
                                      and component library

  `AGENTS.md`                         Cross-tool agent contract
                                      (Cursor, Codex, Gemini)

  `DESIGN.md`                         Visual system and copy rules
  -----------------------------------------------------------------------

## Source Basis

The business rules and ADP wage type values are based on the supplied
PDF documents and the user's subsequent clarification.

Important: where the supplied materials do not define a rule completely,
this documentation marks the item as **TBD** instead of inventing a
payroll rule.
