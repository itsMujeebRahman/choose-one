-- All management writes lock the parent list, so they serialize with picks.
CREATE OR REPLACE FUNCTION manage_choice_list(p_id uuid, p_owner text, p_action text, p_input jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  current_list choice_list%ROWTYPE;
  option_input jsonb;
  original_options jsonb;
  title_input text;
  next_count integer;
BEGIN
  SELECT * INTO current_list FROM choice_list WHERE id = p_id AND user_id = p_owner FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Choice list not found.' USING ERRCODE = 'P0001', DETAIL = '404';
  END IF;

  IF p_action = 'delete' THEN
    DELETE FROM choice_list WHERE id = p_id;
    RETURN jsonb_build_object('id', p_id);
  END IF;

  -- A repeated restart is a no-op, even if the first response was lost.
  IF p_action = 'restart' AND (p_input->>'roundNumber')::integer < current_list.round_number
    AND EXISTS (SELECT 1 FROM choice_list_round WHERE list_id = p_id AND round_number = (p_input->>'roundNumber')::integer)
  THEN RETURN jsonb_build_object('id', p_id); END IF;

  IF p_input ? 'revision' AND (p_input->>'revision')::integer IS DISTINCT FROM current_list.revision THEN
    RAISE EXCEPTION 'This list changed. Refresh it and try again.' USING ERRCODE = 'P0001', DETAIL = '409';
  END IF;

  IF p_action = 'rename' THEN
    title_input := btrim(p_input->>'title');
    IF title_input IS NULL OR length(title_input) NOT BETWEEN 1 AND 100 THEN
      RAISE EXCEPTION 'Enter a list name between 1 and 100 characters.' USING ERRCODE = 'P0001', DETAIL = '400';
    END IF;
    UPDATE choice_list SET title = title_input, revision = revision + 1, updated_at = now() WHERE id = p_id;

  ELSIF p_action = 'options' THEN
    IF jsonb_typeof(p_input->'options') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Provide the unpicked options to save.' USING ERRCODE = 'P0001', DETAIL = '400';
    END IF;
    option_input := p_input->'options';
    next_count := current_list.pick_count + jsonb_array_length(option_input);
    IF next_count NOT BETWEEN 3 AND 20 THEN
      RAISE EXCEPTION 'Keep between 3 and 20 options in the list, including previous picks.' USING ERRCODE = 'P0001', DETAIL = '400';
    END IF;
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(option_input) o
      WHERE jsonb_typeof(o) <> 'object' OR jsonb_typeof(o->'label') IS DISTINCT FROM 'string'
        OR length(btrim(o->>'label')) NOT BETWEEN 1 AND 120) THEN
      RAISE EXCEPTION 'Each option needs a name between 1 and 120 characters.' USING ERRCODE = 'P0001', DETAIL = '400';
    END IF;
    IF EXISTS (
      SELECT label FROM (
        SELECT lower(btrim(o->>'label')) AS label FROM jsonb_array_elements(option_input) o
        UNION ALL SELECT lower(btrim(label)) FROM choice_list_option WHERE list_id = p_id AND selected_order IS NOT NULL
      ) labels GROUP BY label HAVING count(*) > 1
    ) THEN
      RAISE EXCEPTION 'Give each option a different name, including previous picks.' USING ERRCODE = 'P0001', DETAIL = '400';
    END IF;
    IF EXISTS (SELECT o->>'id' FROM jsonb_array_elements(option_input) o WHERE o ? 'id' GROUP BY o->>'id' HAVING count(*) > 1)
      OR EXISTS (SELECT 1 FROM jsonb_array_elements(option_input) o WHERE o ? 'id' AND NOT EXISTS (
        SELECT 1 FROM choice_list_option e WHERE e.id::text = o->>'id' AND e.list_id = p_id AND e.selected_order IS NULL
      )) THEN
      RAISE EXCEPTION 'Only unpicked options from this list can be edited.' USING ERRCODE = 'P0001', DETAIL = '409';
    END IF;
    SELECT coalesce(jsonb_object_agg(id::text, created_at), '{}'::jsonb) INTO original_options
      FROM choice_list_option WHERE list_id = p_id AND selected_order IS NULL;
    DELETE FROM choice_list_option WHERE list_id = p_id AND selected_order IS NULL;
    INSERT INTO choice_list_option(id, list_id, label, sort_order, created_at)
      SELECT coalesce((o.item->>'id')::uuid, gen_random_uuid()), p_id, btrim(o.item->>'label'), slots.slot,
        coalesce((original_options->>(o.item->>'id'))::timestamptz, now())
      FROM jsonb_array_elements(option_input) WITH ORDINALITY AS o(item, position)
      JOIN (
        SELECT slot, row_number() OVER (ORDER BY slot) AS position
        FROM generate_series(1,20) AS slot
        WHERE NOT EXISTS (SELECT 1 FROM choice_list_option p WHERE p.list_id = p_id AND p.sort_order = slot)
      ) slots ON slots.position = o.position;
    UPDATE choice_list SET option_count = next_count, revision = revision + 1, updated_at = now() WHERE id = p_id;

  ELSIF p_action = 'restart' THEN
    IF (p_input->>'roundNumber')::integer IS DISTINCT FROM current_list.round_number
      OR current_list.pick_count <> current_list.option_count THEN
      RAISE EXCEPTION 'Complete this round before starting a new one.' USING ERRCODE = 'P0001', DETAIL = '409';
    END IF;
    INSERT INTO choice_list_round(list_id, round_number, title, picks, completed_at)
      SELECT p_id, current_list.round_number, current_list.title,
        jsonb_agg(jsonb_build_object('id', id, 'label', label, 'selectedOrder', selected_order, 'selectedAt', selected_at) ORDER BY selected_order),
        max(selected_at)
      FROM choice_list_option WHERE list_id = p_id;
    UPDATE choice_list_option SET selected_order = NULL, selected_at = NULL, pick_request_id = NULL WHERE list_id = p_id;
    UPDATE choice_list SET pick_count = 0, round_number = round_number + 1, revision = revision + 1, updated_at = now() WHERE id = p_id;

  ELSIF p_action = 'delete' THEN
    DELETE FROM choice_list WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Unknown list operation.' USING ERRCODE = 'P0001', DETAIL = '400';
  END IF;
  RETURN jsonb_build_object('id', p_id);
END;
$$;
