import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyStateCardProps } from '../types/EmptyStateCardProps'

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <Card className='w-full max-w-md mx-auto mt-8'>
      <CardContent className='flex flex-col items-center p-6 text-center'>
        {icon && <div className='text-4xl mb-4'>{icon}</div>}
        <h2 className='text-2xl font-bold mb-2'>{title}</h2>
        <p className='text-gray-600 mb-4'>{description}</p>
        {actionText && onAction && (
          <Button onClick={onAction}>{actionText}</Button>
        )}
      </CardContent>
    </Card>
  )
}

export default EmptyStateCard