import React from 'react'

type Props = {
    children: React.ReactNode;
}
const layout = ({ children }: Props) => {
  return (
    <div className=' w-full flex justify-center items-center min-h-screen'>
        {children}
    </div>
  )
}

export default layout