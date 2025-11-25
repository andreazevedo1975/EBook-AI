export interface EbookFormData {
  topic: string;
  audience: string;
  goal: string;
  tone: string;
  differentiators: string;
  depth: string;
  coverStyle: string;
}

export enum AppState {
  INTRO = 'INTRO',
  FORM = 'FORM',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

export interface GeneratedEbook {
  title: string;
  content: string; // Markdown formatted content
}