-- AEROQUEST V3.1 synchronization + score reveal patch
-- Run ONCE after migration-v3.sql on an existing AEROQUEST V3 database.

-- Existing V3 answers already contributed to total_score, so mark them as finalized.
alter table public.answers
  add column if not exists score_awarded boolean not null default true;

-- New answers are stored with their calculated points, but those points are
-- not added to players.total_score until the question has been revealed.
create or replace function public.submit_quiz_answer(
  p_player_token text,
  p_code text,
  p_option integer,
  p_correct_option integer,
  p_question_index integer,
  p_correct_text text
)
returns table(points integer, selected_option integer, correct_option integer, correct_text text, already_answered boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players%rowtype;
  v_game public.games%rowtype;
  v_round integer;
  v_remaining numeric;
  v_points integer;
  v_already boolean := false;
begin
  if p_option < 0 or p_option > 3 then raise exception 'Invalid option.'; end if;

  select * into v_player from public.players where player_token = p_player_token;
  if not found then raise exception 'Player session not found.'; end if;

  select * into v_game from public.games where id = v_player.game_id and code = upper(p_code);
  if not found then raise exception 'Game not found.'; end if;
  if v_game.stage not in ('ascension','ignition') or v_game.stage_status <> 'question' then
    raise exception 'Answers are not open.';
  end if;
  if v_game.question_started_at is null then raise exception 'Question timer has not started.'; end if;
  if now() < v_game.question_started_at then raise exception 'Question has not started yet.'; end if;

  v_round := v_game.current_round;
  if exists(select 1 from public.answers where player_id = v_player.id and round = v_round) then
    select points into v_points from public.answers where player_id = v_player.id and round = v_round;
    v_already := true;
    return query select v_points, p_option, p_correct_option, p_correct_text, v_already;
    return;
  end if;

  v_remaining := greatest(0, 30 - extract(epoch from (now() - v_game.question_started_at)));
  if v_remaining <= 0 then raise exception 'Time is up.'; end if;

  if p_option = p_correct_option then
    v_points := 50 + floor((v_remaining / 30.0) * 50);
  else
    v_points := 0;
  end if;

  insert into public.answers(game_id, player_id, round, guessed_year, correct_year, points, answer_text, question_index, score_awarded)
  values(v_game.id, v_player.id, v_round, null, null, v_points, p_option::text, p_question_index, false);

  return query select v_points, p_option, p_correct_option, p_correct_text, false;
end;
$$;

revoke all on function public.submit_quiz_answer(text,text,integer,integer,integer,text) from public, anon, authenticated;
grant execute on function public.submit_quiz_answer(text,text,integer,integer,integer,text) to service_role;

create or replace function public.submit_throwback_answer(
  p_player_token text,
  p_code text,
  p_guess integer,
  p_correct_year integer,
  p_title text
)
returns table(points integer, correct_year integer, guessed_year integer, difference integer, title text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players%rowtype;
  v_game public.games%rowtype;
  v_points integer;
  v_difference integer;
begin
  if p_guess < 1800 or p_guess > 2026 then raise exception 'Invalid year.'; end if;
  select * into v_player from public.players where player_token = p_player_token;
  if not found then raise exception 'Player session not found.'; end if;
  select * into v_game from public.games where id = v_player.game_id and code = upper(p_code);
  if not found then raise exception 'Game not found.'; end if;
  if v_game.stage <> 'throwback' or v_game.status <> 'question' or v_game.stage_status <> 'question' then raise exception 'Answers are not open.'; end if;
  if v_game.question_started_at is null then raise exception 'Question timer has not started.'; end if;
  if now() < v_game.question_started_at then raise exception 'Question has not started yet.'; end if;
  if extract(epoch from (now() - v_game.question_started_at)) > 30 then raise exception 'Time is up.'; end if;
  if exists(select 1 from public.answers where player_id = v_player.id and round = v_game.current_round) then raise exception 'You already answered.'; end if;

  v_difference := abs(p_guess - p_correct_year);
  v_points := greatest(0, 100 - v_difference * 4);
  insert into public.answers(game_id,player_id,round,guessed_year,correct_year,points,answer_text,question_index,score_awarded)
  values(v_game.id,v_player.id,v_game.current_round,p_guess,p_correct_year,v_points,null,v_game.current_round % 10,false);

  return query select v_points,p_correct_year,p_guess,v_difference,p_title;
end;
$$;

revoke all on function public.submit_throwback_answer(text,text,integer,integer,text) from public, anon, authenticated;
grant execute on function public.submit_throwback_answer(text,text,integer,integer,text) to service_role;

-- Idempotently awards all pending points for one revealed question.
create or replace function public.finalize_round_scores(
  p_game_id uuid,
  p_round integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_awarded integer := 0;
  v_row record;
begin
  -- Lock each pending answer while awarding it. If two finalize requests race,
  -- SKIP LOCKED ensures a point is awarded exactly once.
  for v_row in
    select id, player_id, points
    from public.answers
    where game_id = p_game_id
      and round = p_round
      and score_awarded = false
    for update skip locked
  loop
    update public.players
      set total_score = total_score + v_row.points
      where id = v_row.player_id;

    update public.answers
      set score_awarded = true
      where id = v_row.id;

    v_awarded := v_awarded + v_row.points;
  end loop;

  return v_awarded;
end;
$$;

revoke all on function public.finalize_round_scores(uuid,integer) from public, anon, authenticated;
grant execute on function public.finalize_round_scores(uuid,integer) to service_role;
