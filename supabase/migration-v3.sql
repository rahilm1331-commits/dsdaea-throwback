-- THROWBACK V3: three-round event upgrade
-- Run this ONCE in Supabase SQL Editor after your existing V1 schema/performance.sql.

alter table public.games drop constraint if exists games_current_round_check;
alter table public.games add constraint games_current_round_check check (current_round between 0 and 29);

alter table public.games add column if not exists stage text not null default 'throwback';
alter table public.games add column if not exists stage_status text not null default 'not_started';

alter table public.games drop constraint if exists games_stage_check;
alter table public.games add constraint games_stage_check check (stage in ('throwback','ascension','ignition'));
alter table public.games drop constraint if exists games_stage_status_check;
alter table public.games add constraint games_stage_status_check check (stage_status in ('not_started','question','finished'));

alter table public.players add column if not exists participant_id text;
create unique index if not exists players_game_participant_id_idx
  on public.players(game_id, lower(participant_id))
  where participant_id is not null;

alter table public.answers drop constraint if exists answers_round_check;
alter table public.answers add constraint answers_round_check check (round between 0 and 29);

alter table public.answers drop constraint if exists answers_guessed_year_check;
alter table public.answers drop constraint if exists answers_correct_year_check;
alter table public.answers alter column guessed_year drop not null;
alter table public.answers alter column correct_year drop not null;
alter table public.answers add constraint answers_guessed_year_check check (guessed_year is null or guessed_year between 1800 and 2026);
alter table public.answers add constraint answers_correct_year_check check (correct_year is null or correct_year between 1800 and 2026);

alter table public.answers add column if not exists answer_text text;
alter table public.answers add column if not exists question_index integer;
create index if not exists answers_game_round_idx on public.answers(game_id, round);
create index if not exists players_game_score_idx on public.players(game_id, total_score desc, joined_at asc);

-- Replace the old Throwback-only RPC with a generic quiz RPC.
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

  insert into public.answers(game_id, player_id, round, guessed_year, correct_year, points, answer_text, question_index)
  values(v_game.id, v_player.id, v_round, null, null, v_points, p_option::text, p_question_index);

  update public.players set total_score = total_score + v_points where id = v_player.id;
  return query select v_points, p_option, p_correct_option, p_correct_text, false;
end;
$$;

revoke all on function public.submit_quiz_answer(text,text,integer,integer,integer,text) from public, anon, authenticated;
grant execute on function public.submit_quiz_answer(text,text,integer,integer,integer,text) to service_role;

-- New games use the new stage flow. Existing games are left untouched.

-- Ensure Throwback's atomic answer function exists even if the earlier V2
-- performance.sql was never run.
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
  if extract(epoch from (now() - v_game.question_started_at)) > 30 then raise exception 'Time is up.'; end if;
  if exists(select 1 from public.answers where player_id = v_player.id and round = v_game.current_round) then raise exception 'You already answered.'; end if;
  v_difference := abs(p_guess - p_correct_year);
  v_points := greatest(0, 100 - v_difference * 4);
  insert into public.answers(game_id,player_id,round,guessed_year,correct_year,points,answer_text,question_index)
  values(v_game.id,v_player.id,v_game.current_round,p_guess,p_correct_year,v_points,null,v_game.current_round % 10);
  update public.players set total_score = total_score + v_points where id = v_player.id;
  return query select v_points,p_correct_year,p_guess,v_difference,p_title;
end;
$$;
revoke all on function public.submit_throwback_answer(text,text,integer,integer,text) from public, anon, authenticated;
grant execute on function public.submit_throwback_answer(text,text,integer,integer,text) to service_role;
