import Image from 'next/image'
import React from 'react'

function InterviewHeader() {
  return (
    <div className='p-4 shadow-sm'>
  <Image
    src="/login.png"
    alt="logo"
    width={200}
    height={100}
    className="w-35"
  />
</div>

  )
}

export default InterviewHeader
