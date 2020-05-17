import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { theme } from 'galio-framework';

const { width } = Dimensions.get('window');
const androidPhone = () => Platform.OS === 'android';

const BottomMenu = (component) => {
  return (
    <View style={styles.container}>
      {component}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    //marginTop: 3,
    paddingBottom: androidPhone ? 10 : 0,
    backgroundColor: theme.COLORS.WHITE,
    width: width,
    minHeight: '15%',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    borderBottomWidth: 0,
    borderTopWidth: 0.4,
    borderColor: theme.COLORS.GREY
  }
})

export default BottomMenu;