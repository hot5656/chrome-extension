import React from 'react'
import ReactDOM from 'react-dom/client'

const test = <p>Hello Wrold!</p>
// 1. from template.html
// const root = ReactDOM.createRoot(document.getElementById('root'))
// 2. create div element
const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(test)
