import React, {PureComponent} from 'react'
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  PanResponderInstance, Platform,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import styles from './style'

const SUPPORTED_ORIENTATIONS: Array<
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape'
  | 'landscape-left'
  | 'landscape-right'
> = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

const windowHeight = Dimensions.get('window').height
const getHeightFromPercent = (percent: string) => {
  const percentInt = parseInt(percent.replace('%', ''), 10)
  const height = windowHeight
  return height - height * ((100 - percentInt) / 100.0)
}

interface Props {
  animationType?: 'none' | 'slide' | 'fade'
  height?: number | string
  minClosingHeight?: number
  openDuration?: number
  closeDuration?: number
  closeOnDragDown?: boolean
  closeOnPressMask?: boolean
  dragFromTopOnly?: boolean
  closeOnPressBack?: boolean
  keyboardAvoidingViewEnabled?: boolean
  container?: StyleProp<ViewStyle>
  wrapper?: StyleProp<ViewStyle>
  draggableIcon?: StyleProp<ViewStyle>
  background?: string
  onClose?: () => void
  onOpen?: () => void
}

interface State {
  modalVisible: boolean
  animatedHeight: Animated.Value
  pan: Animated.ValueXY
  dialogHeight: number
  wasLayout: boolean
}

class RBSheet extends PureComponent<Props, State> {
  private panResponder?: PanResponderInstance
  constructor(props: Props) {
    super(props)
    this.state = {
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      pan: new Animated.ValueXY(),
      wasLayout: false,
      dialogHeight:
        typeof this.props.height === 'string'
          ? getHeightFromPercent(this.props.height)
          : this.props.height ?? 260,
    }
    this.createPanResponder(props)
  }

  setModalVisible(visible: boolean, callback?: () => void) {
    const {minClosingHeight, closeDuration} = this.props
    const {animatedHeight, pan} = this.state
    if (visible) {
      this.setState({modalVisible: visible}, callback)
    } else {
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: minClosingHeight ?? 0,
        duration: closeDuration ?? 250,
      }).start(() => {
        pan.setValue({x: 0, y: 0})
        this.setState(
          {
            wasLayout: false,
            modalVisible: visible,
            animatedHeight: new Animated.Value(0),
          },
          callback,
        )
      })
    }
  }

  createPanResponder(props: Props) {
    const {closeOnDragDown} = props
    const {pan} = this.state
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnDragDown ?? true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy <= 0) return
        Animated.event([null, {dy: pan.y}], {useNativeDriver: false})(
          e,
          gestureState,
        )
      },
      onPanResponderRelease: (e, gestureState) => {
        if (this.state.dialogHeight / 4 - gestureState.dy < 0) {
          this.setModalVisible(false)
        } else {
          Animated.timing(pan, {
            toValue: {x: 0, y: 0},
            duration: 100,
            useNativeDriver: false,
          }).start()
        }
      },
    })
  }

  open(callback?: () => void) {
    if (this.state.modalVisible) return callback?.()
    this.setModalVisible(true, callback)
  }

  close(callback?: () => void) {
    if (!this.state.modalVisible) return callback?.()
    this.setModalVisible(false, callback)
  }

  renderCloseDraggableIcon() {
    if (this.props.closeOnDragDown === false) return null
    const allowDrag = this.props.dragFromTopOnly ?? false
    const handler = allowDrag && this.panResponder?.panHandlers
    return (
      <View
        {...handler}
        style={[
          styles.draggableContainer,
          {backgroundColor: this.props.background},
        ]}>
        <View style={[styles.draggableIcon, this.props.draggableIcon]} />
      </View>
    )
  }

  animateShow = () => {
    Animated.timing(this.state.animatedHeight, {
      useNativeDriver: false,
      toValue: this.state.dialogHeight,
      duration: this.props.openDuration ?? 250,
      isInteraction: true,
    }).start()
  }

  renderChildren() {
    // @ts-ignore
    const panStyle: StyleProp<ViewStyle> = {
      transform: this.state.pan.getTranslateTransform(),
    }

    const allowDrag = this.props.dragFromTopOnly ?? false
    const handler = !allowDrag && this.panResponder?.panHandlers

    return (
      <Animated.View
        {...handler}
        style={[
          panStyle,
          styles.container,
          {height: this.state.wasLayout ? this.state.animatedHeight : (Platform.OS === 'ios' ? 'auto' : 1)},
          this.props.container,
        ]}>
        {this.renderCloseDraggableIcon()}
        <View
          style={this.state.wasLayout ? {height: this.state.dialogHeight} : undefined}
          onLayout={(e) => {
            if (this.state.wasLayout) return
            const height = this.props.height
              ? this.state.dialogHeight
              : Math.min(windowHeight * 0.9, e.nativeEvent.layout.height) +
                21
            console.log('===', height, this.state.dialogHeight)
            this.setState(
              {wasLayout: true, dialogHeight: height},
              this.animateShow,
            )
          }}>
          {this.props.children}
        </View>
      </Animated.View>
    )
  }

  render() {
    const {
      animationType,
      closeOnPressMask,
      closeOnPressBack,
      keyboardAvoidingViewEnabled,
    } = this.props
    const {modalVisible} = this.state

    return (
      <Modal
        transparent
        animationType={animationType}
        visible={modalVisible}
        supportedOrientations={SUPPORTED_ORIENTATIONS}
        onRequestClose={() => {
          if (closeOnPressBack ?? true) this.setModalVisible(false)
        }}>
        <KeyboardAvoidingView
          enabled={keyboardAvoidingViewEnabled ?? false}
          behavior='padding'
          style={[styles.wrapper, this.props.wrapper]}>
          <TouchableOpacity
            style={styles.mask}
            activeOpacity={1}
            onPress={() => (closeOnPressMask ?? true ? this.close() : null)}
          />
          {this.renderChildren()}
        </KeyboardAvoidingView>
      </Modal>
    )
  }
}

export default RBSheet
