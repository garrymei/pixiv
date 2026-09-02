import { Component, PropsWithChildren } from 'react'
import { syncPublishTabEntry } from './services/app-settings'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('App launched.')
    void syncPublishTabEntry(true)
  }

  componentDidShow() {
    console.log('App shown.')
    void syncPublishTabEntry(true)
  }

  componentDidHide() {
    console.log('App hidden.')
  }

  render() {
    return this.props.children
  }
}

export default App
