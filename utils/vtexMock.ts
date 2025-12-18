
import { VTEXProduct } from '../types';

// Fix: Restructured mock data to match VTEXProduct interface required by types.ts
export const mockProducts: VTEXProduct[] = [
  {
    productId: '101',
    productName: 'Gaming Headphones Pro X',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/hp1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 150.00,
              ListPrice: 199.99,
              AvailableQuantity: 50,
              Installments: [
                { Value: 12.50, NumberOfInstallments: 12, TotalValuePlusInterest: 150.00 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '102',
    productName: 'Mechanical Keyboard RGB',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/kb1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 89.90,
              ListPrice: 120.00,
              AvailableQuantity: 15,
              Installments: [
                { Value: 14.98, NumberOfInstallments: 6, TotalValuePlusInterest: 89.90 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '103',
    productName: 'Ultra Ergonomic Mouse',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/ms1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 45.00,
              ListPrice: 45.00,
              AvailableQuantity: 0,
              Installments: [
                { Value: 15.00, NumberOfInstallments: 3, TotalValuePlusInterest: 45.00 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '104',
    productName: '4K Monitor 27"',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/mn1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 399.00,
              ListPrice: 450.00,
              AvailableQuantity: 22,
              Installments: [
                { Value: 33.25, NumberOfInstallments: 12, TotalValuePlusInterest: 399.00 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '105',
    productName: 'Desk Mat XL Leather',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/dm1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 29.99,
              ListPrice: 35.00,
              AvailableQuantity: 100,
              Installments: [
                { Value: 29.99, NumberOfInstallments: 1, TotalValuePlusInterest: 29.99 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '106',
    productName: 'Smartphone Case Slim',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/cs1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 12.00,
              ListPrice: 15.00,
              AvailableQuantity: 8,
              Installments: [
                { Value: 12.00, NumberOfInstallments: 1, TotalValuePlusInterest: 12.00 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '107',
    productName: 'Bluetooth Speaker Portable',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/sp1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 55.00,
              ListPrice: 65.00,
              AvailableQuantity: 0,
              Installments: [
                { Value: 9.16, NumberOfInstallments: 6, TotalValuePlusInterest: 55.00 }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    productId: '108',
    productName: 'Webcam 1080p HD',
    items: [
      {
        images: [{ imageUrl: 'https://picsum.photos/seed/wc1/1000/1000' }],
        sellers: [
          {
            commertialOffer: {
              Price: 79.00,
              ListPrice: 99.00,
              AvailableQuantity: 45,
              Installments: [
                { Value: 13.16, NumberOfInstallments: 6, TotalValuePlusInterest: 79.00 }
              ]
            }
          }
        ]
      }
    ]
  }
];
