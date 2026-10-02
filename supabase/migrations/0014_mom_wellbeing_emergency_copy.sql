UPDATE public.content
SET body =
  left(
    body,
    position(E'\n\n**Safety / Escalation Note:**\n' IN body) - 1
  ) ||
  E'\n\n**Safety / Escalation Note:**\nCall 911, call or text 988.'
WHERE category = 'mom_wellbeing'
  AND position(E'\n\n**Safety / Escalation Note:**\n' IN body) > 0;