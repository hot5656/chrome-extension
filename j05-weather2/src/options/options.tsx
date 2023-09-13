import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import '@fontsource/roboto'
import './options.css'
import {
  LocalStorageOptions,
  getStoredOptions,
  setStoredOptions,
} from '../utils/storage'

type FormState = 'ready' | 'saving'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [formState, setFormState] = useState<FormState>('ready')

  useEffect(() => {
    getStoredOptions().then((options) => setOptions(options))
  }, [])

  const handleHomeCityChange = (homeCity: string) => {
    setOptions({
      ...options,
      homeCity,
    })
  }

  const handleAutoOverayChange = (hasAutoOverlay: boolean) => {
    setOptions({
      ...options,
      hasAutoOverlay,
    })
  }

  const handleSaveButtonClick = () => {
    setFormState('saving')
    setStoredOptions(options).then(() => {
      setTimeout(() => {
        setFormState('ready')
      }, 1000)
    })
  }

  if (!options) {
    return null
  }

  const isFieldsDisabled = formState === 'saving'

  return (
    <Box mx="10%" my="2%">
      <Card>
        <CardContent>
          <Grid container direction="column" spacing="10">
            <Grid item>
              <Typography variant="h4">Weather Extension Options</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">Home City name</Typography>
              <TextField
                fullWidth
                placeholder="Enter a home city name"
                value={options.homeCity}
                onChange={(event) => handleHomeCityChange(event.target.value)}
                disabled={isFieldsDisabled}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <Typography variant="body1">
                Auto toggle overlay on webpage load
              </Typography>
              <Switch
                color="primary"
                checked={options.hasAutoOverlay}
                onChange={(event, checked) => handleAutoOverayChange(checked)}
                disabled={isFieldsDisabled}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveButtonClick}
                disabled={isFieldsDisabled}
              >
                {formState === 'ready' ? 'Save' : 'Saving...'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
