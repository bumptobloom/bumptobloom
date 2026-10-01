UPDATE public.content
SET body =
  split_part(
    body,
    E'\n\n**Safety / Escalation Note:**\n',
    1
  ) ||
  E'\n\n**Safety / Escalation Note:**\nCall 911, call or text 988.'
WHERE category = 'mom_wellbeing'
  AND body LIKE '%**Safety / Escalation Note:%';