create table if not exists shop_meta (
  user_id text not null,
  key text not null,
  value text not null,
  primary key (user_id, key)
);
