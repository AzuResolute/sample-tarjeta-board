import React from 'react'
import {Navbar} from './components'
import Routes from './routes'

const App = () => {
  return (
    <div id="main" style={{height: window.innerHeight}}>
      <Navbar />
      <Routes />
    </div>
  )
}

export default App
