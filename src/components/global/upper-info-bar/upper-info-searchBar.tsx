import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'

type Props = {}

const SearchBar = () => {
  return (
    <div className='min-w-[60%] relative flex items-center border rounded-full bg-primary-90'>
      <Button
        type='submit'
        size='sm'
        variant='ghost'
        className='absolute left-0 h-full rounded-l-none bg-transparent'
      >
        <Search className='h-4 w-4' />
      </Button>
      <Input
        type='text'
        placeholder='Search'
        className='flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ml-6  rounded-xl'
      />
    </div>
  ) 
}

export default SearchBar
