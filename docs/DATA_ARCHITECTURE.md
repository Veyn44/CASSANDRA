# CASSANDRA data architecture

## Stable identifiers
Data IDs are immutable and encode their family in a three-letter prefix followed by four digits:
- `MOD0001`: module definition
- `MAT0001`: material definition
- `AST0001`: asteroid / generated cosmic body
- Additional families receive their own documented three-letter prefix.

Display names, descriptions, categories, balancing values and asset paths may change without changing an ID. IDs are not display labels.

## Data and assets
Definitions live under `src/data/`; external visual files live under `assets/`. The renderer consumes asset references and visual properties; it must not infer gameplay meaning from display names.

## Cosmic bodies
A body is a two-dimensional set of occupied grid cells. Its width and height describe its bounding box; `occupiedTileCount` describes the actual cell count. Generation is deterministic from the seed and parameters. The body stores true world data independently of player visibility.

## Visibility
Visibility is player knowledge, not world state. Revealing or hiding a cell must never delete or mutate its underlying world data. The initial surface visibility and later scanner reveals are handled by `visibility-manager.js`.

## Researcher action points
The current prototype starts with 12 action points per turn. The turn manager restores the pawn to its configured maximum when a turn advances.

## Game modes
Normal and developer modes share the same game systems. Their differences are expressed through a configuration object rather than separate simulation implementations.
