import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

type Props = {}

const SearchBar = () => {
  return (
    <div className='min-w-[60%] relative flex items-center'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none' />
      <Input
        type='text'
        placeholder='Search'
        className='w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-800 text-neutral-100 border border-transparent transition-colors focus:bg-neutral-700 focus:border-blue-600 focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800 placeholder-neutral-500 focus:outline-none'
      />
    </div>
  )
}

export default SearchBar
