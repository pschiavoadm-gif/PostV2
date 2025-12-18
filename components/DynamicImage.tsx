
import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface DynamicImageProps {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  id: string;
  draggable?: boolean;
  onDragEnd?: (e: any) => void;
  onTransformEnd?: (e: any) => void;
  onClick?: (e: any) => void;
}

const DynamicImage: React.FC<DynamicImageProps> = (props) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = props.url;
    img.onload = () => {
      setImage(img);
    };
  }, [props.url]);

  if (!image) return null;

  return (
    <KonvaImage
      {...props}
      image={image}
    />
  );
};

export default DynamicImage;
