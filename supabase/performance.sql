-- Run this once in Supabase SQL Editor after the original schema.
-- It adds the fast, atomic answer-submission function used by the updated app.

create or replace function public.submit_throwback_answer(
  p_player_token text,
  p_code text,
  p_guess integer,
  p_correct_year integer,
  p_title text
)
returns table (
  points integer,
  correct_year integer,
  guessed_year integer,
  difference integer,
  title text
)
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
  if p_guess < 1800 or p_guess > 2026 then
    raise exception 'Invalid year.';
  end if;

  select * into v_player
  from public.players
  where player_token = p_player_token;

  if not found then
    raise exception 'Player session not found.';
  end if;

  select * into v_game
  from public.games
  where id = v_player.game_id
    and code = upper(p_code);

  if not found then
    raise exception 'Game not found.';
  end if;

  if v_game.status <> 'question' then
    raise exception 'Answers are not open.';
  end if;

  if v_game.question_started_at is null then
    raise exception 'Question timer has not started.';
  end if;

  if extract(epoch from (now() - v_game.question_started_at)) > 30 then
    raise exception 'Time is up.';
  end if;

  if exists (
    select 1 from public.answers
    where player_id = v_player.id
      and round = v_game.current_round
  ) then
    raise exception 'You already answered.';
  end if;

  v_difference := abs(p_guess - p_correct_year);
  v_points := greatest(0, 100 - v_difference * 4);

  insert into public.answers (
    game_id, player_id, round, guessed_year, correct_year, points
  ) values (
    v_game.id, v_player.id, v_game.current_round, p_guess, p_correct_year, v_points
  );

  update public.players
  set total_score = total_score + v_points
  where id = v_player.id;

  return query
  select v_points, p_correct_year, p_guess, v_difference, p_title;
end;
$$;

revoke all on function public.submit_throwback_answer(text, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.submit_throwback_answer(text, text, integer, integer, text) to service_role;
