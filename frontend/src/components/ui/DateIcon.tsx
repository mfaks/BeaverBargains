import { DateIconProps } from '@/types/DateIconProps'
import React from 'react'


const DateIcon: React.FC<DateIconProps> = ({ date }) => {
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()

  return (
    <div className="w-16 h-16 bg-orange-100 border-2 border-orange-300 rounded-lg flex flex-col items-center justify-center text-orange-800">
      <div className="text-xs font-semibold uppercase">{month}</div>
      <div className="text-2xl font-bold">{day}</div>
    </div>
  )
}

export default DateIcon