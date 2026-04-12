import React, { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('App launched.')
  }

  componentDidShow() {
    console.log('App shown.')
  }

  componentDidHide() {
    console.log('App hidden.')
  }

  render() {
    return this.props.children
  }
}

export default App
