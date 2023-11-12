import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './options.css'

const App: React.FC<{}> = () => {
  const [vttContent, setVttContent] = useState<string>('')

  function handleSubtitleFileChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile) {
      // Handle the selected file, e.g., read its contents
      const reader = new FileReader()

      reader.onload = function (e) {
        const vttData = e.target.result

        const subtitleUrl = URL.createObjectURL(event.target.files[0])
        console.log('subtitleUrl:', subtitleUrl)

        setVttContent(vttData as string)
      }

      reader.readAsText(selectedFile)
    }
  }
  return (
    <div>
      <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
      {vttContent && (
        <div>
          <h2>Loaded VTT Content:</h2>
          <pre>{vttContent}</pre>
        </div>
      )}
    </div>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
