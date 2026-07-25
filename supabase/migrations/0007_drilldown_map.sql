-- Locations get their own optional map image (a "local" map for their
-- children to be pinned on — e.g. Greyfen's town map), turning the single
-- flat campaign map into a recursive hierarchy: the world map only ever
-- shows top-level locations; a location's own map only ever shows its
-- immediate children.
--
-- map_x/map_y are re-scoped by this change: they now mean "position on
-- whichever map image this location's PARENT provides" (the campaign's
-- world map for a top-level location, or the parent location's own
-- map_image_url otherwise) rather than "position on the one campaign map".
-- Any coordinates already set on a nested location were placed under the
-- old flat semantic and are meaningless under the new one, so we clear them
-- — they'll just not render as a pin anywhere until the DM places them on
-- their actual parent's map once one exists.

alter table public.locations add column map_image_url text;

update public.locations
set map_x = null, map_y = null
where parent_location_id is not null and (map_x is not null or map_y is not null);
