import Link from 'next/link'
import React from 'react'

const QuickButton = ({children,type,onClick,href}) => {
  return (
    <Link href={href}>
    
      <button
        type={type}
        onClick={onClick}
        className="w-36 p-1 m-1 rounded-md shadow-sm text-black bg-black84 hover:text-black72 hover:scale-105 hover:opacity-80"
      >
        {children}
      </button>
   
  </Link>
  )
}

export default QuickButton