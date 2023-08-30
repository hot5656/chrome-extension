import React from 'react'
import ReactDOM from 'react-dom/client'
import './popup.css'

function App() {
  return (
    <div>
      <img src="icon.png" />
    </div>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
