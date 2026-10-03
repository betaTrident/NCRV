# ADP Wage Type Configuration

## Purpose

Wage type codes are a core part of the computation.

The application must not assume that every shift produces only one wage
type.

Instead:

> One ND calculation → one or more applicable wage type lines.

## Supplied ADP Codes

The supplied ADP Codes document contains separate tables for
ordinary/overtime/holiday computation and computation with Night Shift
Differential.

The following Night Shift Differential values are transcribed from the
supplied table.

  --------------------------------------------------------------------------
  Category         Hours            Total % to be added            Wage Type
  ---------------- --------------- -------------------- --------------------
  Ordinary Day (on First 8 hours                    10%                 2211
  night shift)                                          

  Ordinary Day (on Excess of the                   138%                 2252
  night shift)     1st 8 hours                          

  Rest Day OR      First 8 hours                   143%                 2411
  Special Public                                        
  Holiday                                               

  Special Public   First 8 hours                   165%                 2412
  Holiday + Rest                                        
  Day                                                   

  Special Public   Excess of the                   215%                 2512
  Holiday + Rest   1st 8 hours                          
  Day                                                   

  Regular/Public   First 8 hours                   120%                 2413
  Holiday                                               

  Regular/Public   Excess of the                   286%                 2513
  Holiday          1st 8 hours                          

  Regular/Public   First 8 hours                   286%                 2414
  Holiday + Rest                                        
  Day                                                   

  Regular/Public   Excess of the                   372%                 2514
  Holiday + Rest   1st 8 hours                          
  Day                                                   

  Double Regular   First 8 hours                   230%                 2415
  Holiday                                               

  Double Regular   Excess of the                   429%                 2515
  Holiday          1st 8 hours                          

  Double Regular   First 8 hours                   429%                 2416
  Holiday + Rest                                        
  Day                                                   

  Double Regular   Excess of the                   558%                 2516
  Holiday + Rest   1st 8 hours                          
  Day                                                   

  Special Public   First 8 hours                    43%                 2418
  Holiday                                               

  Special Public   Excess of the                   186%                 2511
  Holiday          1st 8 hours                          
  --------------------------------------------------------------------------

## Important Interpretation Rule

The source labels the percentage column:

> `TOTAL % to be added`

Therefore, the application should preserve this meaning and use the
configured payroll formula rather than automatically interpreting every
value as a simple ND percentage.

## Multiple Wage Types

The database must support:

``` text
ND Record
  ├── Wage Type Line 1
  ├── Wage Type Line 2
  └── Wage Type Line N
```

This is necessary because applicable codes can vary case-by-case.

## Recommended Table

### `wage_types`

  Field               Purpose
  ------------------- --------------------------------------
  `id`                Internal identifier
  `code`              ADP wage type code
  `category`          Day/holiday category
  `hours_category`    First 8 hours / excess
  `percentage`        Configured percentage
  `is_nd`             Whether this is an ND wage type
  `description`       Human-readable description
  `active`            Whether the rule is currently usable
  `effective_from`    Optional effective date
  `effective_until`   Optional expiry date

## Non-ND Codes

The supplied table also contains non-ND wage type codes. These should be
retained as reference/configuration data if the application needs to
display or compare them, but the first version should focus on the Night
Shift Differential table.

Examples from the supplied table include:

-   2251
-   2301
-   2215
-   2235
-   2170
-   2226
-   2240
-   2246
-   2425
-   2535
-   2420
-   2520
-   2430
-   2233

Do not invent additional codes where the source does not provide one.

## Future-Proofing

Wage types must be data-driven rather than embedded directly inside
application code.

The calculation engine should ask the wage-type configuration:

``` text
Given:
- day category
- hours category
- ND = true

Return:
- all matching wage-type rules
```
