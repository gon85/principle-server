export const AnalysisItemTypes = {
  Period: 'period',
  Profit: 'profit',
  RebuyStrategy: 'rebuy',
};
export type AnalysisItemTypes = typeof AnalysisItemTypes[keyof typeof AnalysisItemTypes];
