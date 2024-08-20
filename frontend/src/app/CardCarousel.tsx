import React, { useRef, useEffect, useState } from 'react'

const CardCarousel: React.FC = () => {

  const placeholderImages = [
    '/images/market.png',
    '/images/favorites.png',
    '/images/messages.png',
    '/images/listings.png',
    '/images/mark_as_sold.png',
    '/images/listing_history.png',
    '/images/order_history.png',
    '/images/reactivate.png',
    '/images/sell.png',
  ]

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<string>('100%')
  const [animationState, setAnimationState] = useState<'running' | 'paused'>('paused')

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(`${containerRef.current.scrollWidth}px`)
      setAnimationState('running')
    }
  }, [])

  return (
    <div className="overflow-hidden w-full">
      <div 
        ref={containerRef}
        className="flex space-x-4 py-4"
        style={{
          width: containerWidth,
          animationPlayState: animationState,
          animation: 'scroll 30s linear infinite',
        }}
      >
        {placeholderImages.concat(placeholderImages).map((imageUrl, index) => (
          <div
            key={index}
            className="w-[300px] h-[200px] rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 border-orange-300 flex-shrink-0"
          >
            <img
              src={imageUrl}
              alt={`Placeholder ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardCarousel