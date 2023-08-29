import React from 'react'
import ReactDOM from 'react-dom/client'
import './options.css'

// const test = <p>Hello Wrold!</p>
const test = <img src="icon.png" />

// create div element
const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(test)
