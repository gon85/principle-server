export const AnalysisItemTypes = {
  Period: 'period',
  Profit: 'profit',
};
export type AnalysisItemTypes = typeof AnalysisItemTypes[keyof typeof AnalysisItemTypes];
