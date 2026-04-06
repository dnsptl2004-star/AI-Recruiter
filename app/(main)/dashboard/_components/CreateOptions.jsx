import React from 'react'
import { Phone, Video } from "lucide-react";
import Link from "next/link";

function CreateOptions() {
  return (
    <div className='grid grid-cols-2 gap-5'>
      <Link href={'/dashboard/create-interview'} className='bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2 cursor-pointer'>
       <Video className='p-3 text-primary bg-blue-50 rounded-lg h-12 w-12'/>
       <h2 className='font-bold'>Create New Interview</h2>
       <p className='text-gray-500'>Create AI Interviews and schedule then with Candidates</p>
       </Link>
        <Link href={'/dashboard/PhoneScheduler'} className='bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2 cursor-pointer'>
       <Phone className='p-3 text-primary bg-blue-50 rounded-lg h-12 w-12'/>
       <h2 className='font-bold'>Create Phone screening Call</h2>
       <p className='text-gray-500'>schedule Phone screening call with Candidates</p>
       </Link>
    </div>
  )
}

export default CreateOptions
