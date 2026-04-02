import { Component, PropsWithChildren } from 'react'
import { bootstrapCurrentUser } from './services/user'
import './app.scss'

class App extends Component<PropsWithChildren> {

  componentDidMount () {
    bootstrapCurrentUser().catch(() => undefined)
  }

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
