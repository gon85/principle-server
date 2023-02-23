const AlarmCategories = {
  AnalysisTime: 'AT',
  EndStockMarke: 'EM',
} as const;
export type AlarmCategories = typeof AlarmCategories[keyof typeof AlarmCategories];
