import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import ApplePieApp from './components/ApplePieApp'

function App() {

  return (
    <Monetization>
      <ApplePieApp />
    </Monetization>
  )
}

export default App