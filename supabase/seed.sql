insert into public.wage_types (
  code,
  category,
  hours_category,
  percentage,
  is_nd,
  description,
  active
)
values
  ('2211', 'REGULAR_WORK_DAY', 'FIRST_8', 10, true, 'Ordinary day, night shift, first 8 hours', true),
  ('2252', 'REGULAR_WORK_DAY', 'EXCESS', 138, true, 'Ordinary day, night shift, excess of the first 8 hours', true),
  ('2411', 'REST_DAY', 'FIRST_8', 143, true, 'Rest day, first 8 hours', true),
  ('2411', 'SPECIAL_PUBLIC_HOLIDAY', 'FIRST_8', 143, true, 'Special public holiday, first 8 hours', true),
  ('2418', 'SPECIAL_PUBLIC_HOLIDAY', 'FIRST_8', 43, true, 'Special public holiday, first 8 hours', true),
  ('2511', 'SPECIAL_PUBLIC_HOLIDAY', 'EXCESS', 186, true, 'Special public holiday, excess of the first 8 hours', true),
  ('2412', 'SPECIAL_PUBLIC_HOLIDAY_REST_DAY', 'FIRST_8', 165, true, 'Special public holiday and rest day, first 8 hours', true),
  ('2512', 'SPECIAL_PUBLIC_HOLIDAY_REST_DAY', 'EXCESS', 215, true, 'Special public holiday and rest day, excess', true),
  ('2413', 'REGULAR_PUBLIC_HOLIDAY', 'FIRST_8', 120, true, 'Regular or public holiday, first 8 hours', true),
  ('2513', 'REGULAR_PUBLIC_HOLIDAY', 'EXCESS', 286, true, 'Regular or public holiday, excess', true),
  ('2414', 'REGULAR_PUBLIC_HOLIDAY_REST_DAY', 'FIRST_8', 286, true, 'Regular or public holiday and rest day, first 8 hours', true),
  ('2514', 'REGULAR_PUBLIC_HOLIDAY_REST_DAY', 'EXCESS', 372, true, 'Regular or public holiday and rest day, excess', true),
  ('2415', 'DOUBLE_REGULAR_HOLIDAY', 'FIRST_8', 230, true, 'Double regular holiday, first 8 hours', true),
  ('2515', 'DOUBLE_REGULAR_HOLIDAY', 'EXCESS', 429, true, 'Double regular holiday, excess', true),
  ('2416', 'DOUBLE_REGULAR_HOLIDAY_REST_DAY', 'FIRST_8', 429, true, 'Double regular holiday and rest day, first 8 hours', true),
  ('2516', 'DOUBLE_REGULAR_HOLIDAY_REST_DAY', 'EXCESS', 558, true, 'Double regular holiday and rest day, excess', true)
on conflict (code, category, hours_category) do nothing;
