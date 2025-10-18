import { useState } from 'react';
import MediaAsset from '../types/MediaAsset';

type CarouselProps = {
  mediaAssets: MediaAsset[];
};

const Carousel = ({ mediaAssets }: CarouselProps) => {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + mediaAssets.length) % mediaAssets.length);
  const next = () => setIndex((i) => (i + 1) % mediaAssets.length);

  return (
    <div className="relative w-full">
      {mediaAssets.map((asset, i) => (
        <div
          key={i}
          className={
            'carousel-item w-full transition-opacity duration-300 ' +
            (i === index ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none absolute top-0 left-0')
          }
        >
          <img src={asset.publicUrl} className="w-full" alt={`slide-${i}`} />
        </div>
      ))}

      <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
        <button onClick={prev} className="btn btn-circle" aria-label="previous">
          ❮
        </button>
        <button onClick={next} className="btn btn-circle" aria-label="next">
          ❯
        </button>
      </div>
    </div>
  );
};

export default Carousel;
