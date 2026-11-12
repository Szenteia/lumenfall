const LEGACY = Object.freeze({width:17,height:13});
const EXPANDED = Object.freeze({width:21,height:15});
// Geometry is selected by supported rules, never arbitrary saved dimensions.
export function expeditionSize(state) {
  if(state?.version===1)return LEGACY;
  const rules=state?.rulesVersion;
  if(rules===3)return EXPANDED;
  if(rules===undefined||rules===0||rules===1||rules===2)return LEGACY;
  return null;
}
