// cytoscape-fcose ships no types; we only ever pass it to cytoscape.use().
declare module "cytoscape-fcose" {
  const ext: cytoscape.Ext;
  export default ext;
}
