import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import { SHOW_ACTIVE, LANGUGAES_INFO, UDAL_MODE } from '../utils/messageType'

window.addEventListener('load', function () {
  console.log('contentScript load...')
})

// Function to handle link clicks
function handleLinkClick(event) {
  setTimeout(() => {
    console.log('=====================================')
    console.log('handleLinkClick :', event)
    console.log('target :', event.target)
  }, 300)
}

// Attach the click event listener to the entire document
document.addEventListener('click', handleLinkClick)
