import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WalletPredict from './components/WalletPredict'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className=''>
      <WalletPredict />
    </div>
  )
}

export default App
