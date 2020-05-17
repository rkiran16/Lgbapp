import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Block, Text } from "galio-framework";
import { argonTheme } from "../constants";

const Spinner = props => {
  const { textColor, color, size, } = props;
  const textStyles = [
    styles.text,
    textColor && styles.textColor,
    {...props.style}
  ];
  return (
    <Block style={styles.spinnerStyle}>
      <ActivityIndicator size={size ||'small'} color={color} />
      <Block style={{alignItems:'center', justifyContent:'center', width:'auto'}}>
        {props.label ? 
        <Text style={textStyles}>{props.label}</Text> : null
        }
      </Block>
    </Block>
  );
};

const styles = {
  spinnerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  text: {
    fontSize: 15, fontFamily: 'regular', alignItems:'center' 
  },
  textColor:{
    color:argonTheme.COLORS.GRADIENT_START
  }
};

export default Spinner;