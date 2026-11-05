// Route all future resource checks and costs through this module.
// Developer Mode bypasses every cost, regardless of the resource type.
export function getResourceAmount(state, resourceId) {
  return state.devMode ? Infinity : (state.resources[resourceId] ?? 0);
}
export function hasResource(state, resourceId, amount = 1) {
  return state.devMode || getResourceAmount(state, resourceId) >= amount;
}
export function consumeResource(state, resourceId, amount = 1) {
  if (state.devMode) return true;
  if (!hasResource(state, resourceId, amount)) return false;
  state.resources[resourceId] -= amount;
  return true;
}
export function addResource(state, resourceId, amount) {
  state.resources[resourceId] = (state.resources[resourceId] ?? 0) + amount;
  return state.resources[resourceId];
}