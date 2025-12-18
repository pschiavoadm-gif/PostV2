
import { CanvasFormat } from './types';

export const FORMATS: Record<'SQUARE' | 'STORY', CanvasFormat> = {
  SQUARE: {
    id: 'SQUARE',
    name: 'Square (1:1)',
    width: 1000,
    height: 1000,
  },
  STORY: {
    id: 'STORY',
    name: 'Story (9:16)',
    width: 1080,
    height: 1920,
  },
};

export const FONTS = [
  'Exo',
  'Inter',
  'Montserrat',
  'Roboto',
  'Arial',
  'Georgia',
  'Times New Roman'
];
