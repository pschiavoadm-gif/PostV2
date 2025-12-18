
export type LayerType = 'IMAGE' | 'TEXT' | 'DYNAMIC_IMAGE' | 'DYNAMIC_TEXT' | 'DYNAMIC_BADGE';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  opacity: number;
  locked?: boolean; // Nueva propiedad para bloquear la capa
  
  // Image specific
  url?: string;
  
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontStyle?: 'normal' | 'italic' | 'bold';
  align?: 'left' | 'center' | 'right';
  
  // Dynamic specific
  placeholderKey?: '{{ProductImage}}' | '{{Price}}' | '{{Installments}}' | '{{Badge}}' | '{{InstallmentCount}}' | '{{InstallmentValue}}' | '{{InstallmentType}}' | '{{ProductName}}';
}

export interface CanvasFormat {
  id: 'SQUARE' | 'STORY';
  name: string;
  width: number;
  height: number;
}

export interface VTEXInstallment {
  Value: number;
  NumberOfInstallments: number;
  TotalValuePlusInterest: number;
}

export interface VTEXProduct {
  productId: string;
  productName: string;
  brand?: string;
  items: {
    images: { imageUrl: string }[];
    sellers: {
      commertialOffer: {
        Price: number;
        ListPrice: number;
        AvailableQuantity: number;
        Installments?: VTEXInstallment[];
      };
    }[];
  }[];
}
