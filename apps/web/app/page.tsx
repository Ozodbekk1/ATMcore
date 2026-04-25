import { Button } from '@repo/ui/button'
import React from 'react'

const page = () => {
  return (
    <div className='bg-background p-4'>
      <h1 className='text-white'>Hello World</h1>
      <p className='text-gray-400'>This is a simple page.</p>
      <Button variant={"outline"}>Click me</Button>
    </div>
  )
}

export default page