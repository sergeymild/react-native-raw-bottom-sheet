import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mask: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  draggableIcon: {
    width: 35,
    height: 5,
    borderRadius: 5,
    margin: 10,
    backgroundColor: '#ccc',
  },
})

export default styles
