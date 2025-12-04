/*
  # Allow Insert and Update for Anonymous Users
  
  Since this is a client-side scanner app without authentication, 
  we need to allow the anonymous role to insert and update opportunities.
*/

create policy "Enable insert for anon users"
on "public"."arbitrage_opportunities"
as PERMISSIVE
for INSERT
to anon
with check (true);

create policy "Enable update for anon users"
on "public"."arbitrage_opportunities"
as PERMISSIVE
for UPDATE
to anon
using (true)
with check (true);
