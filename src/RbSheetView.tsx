import React, {useContext, useRef} from 'react'
import {View, ViewProps} from 'react-native'
import {RBContext} from 'react-native-raw-bottom-sheet/src'

interface Props extends ViewProps {}

const RbSheetView: React.FC<Props> = (props) => {
  const wasLayout = useRef<boolean>(false)
  const context = useContext(RBContext)

  return (
    <View
      {...props}
      onLayout={(e) => {
        if (wasLayout.current) return
        wasLayout.current = true
        context.setHeight(e.nativeEvent.layout.height + 25)
      }}>
      {props.children}
    </View>
  )
}

export default RbSheetView
