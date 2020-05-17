import React, { Component } from 'react';
import { TextInput, Animated, StyleSheet } from 'react-native';
import { argonTheme, Util } from "../constants";
import PropTypes from 'prop-types';
// Galio components
import { theme, Block } from "galio-framework";

class FloatingLabelInput extends Component {
  state = {
    isFocused: false,
  };

  componentWillMount() {
    this._animatedIsFocused = new Animated.Value(this.props.value === '' ? 0 : 1);
  }

  handleFocus = () => this.setState({ isFocused: true });
  handleBlur = () => this.setState({ isFocused: false });

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
      toValue: (this.state.isFocused || this.props.value !== '') ? 1 : 0,
      duration: 200,
    }).start();
  }

  render() {
    const { iAnimate, tb, lborder, lborders, noBorder, lfont, lfonts, lcolor, label, stylex, ww, required, autoCorrect, textContentType, autoCapitalize, small, min, secureTextEntry, keyboardType, returnKeyType, autoCompleteType, autoCorrects, multiline, numberOfLines, inputChangeHandler, onSubmitEditing,  ...props } = this.props;

    const inputStyles = [
      styles.defaultStyle,
      lborder && styles.lborder,
      lborders && styles.lborders,
      tb && styles.thinBorder,
      noBorder && styles.noBorder,
      ww && styles.rInput,
      small && styles.small,
      {...props.style}
    ];

    const labelStyle = {
      fontFamily: 'regular',
      position: 'absolute',
      left: 0,
      top: this._animatedIsFocused.interpolate({
        inputRange: [iAnimate && iAnimate.inputRange ? iAnimate.inputRange : 0, iAnimate && iAnimate.inputRanges ? iAnimate.inputRanges:1],
        outputRange: [iAnimate && iAnimate.outputRange ? iAnimate.outputRange : 18, 0], 
      }),
      fontSize: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [lfont?lfont:20, lfonts?lfonts:14],
      }),
      color: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [lcolor ? lcolor:argonTheme.COLORS.BLACK, lcolor?lcolor:'#000'],
      }),
    };
    return (
      <Block style={{ paddingTop: iAnimate && iAnimate.paddingTop ? iAnimate.paddingTop : 25 }}>
        <Animated.Text style={labelStyle}>
          {label}
        </Animated.Text>
        <TextInput
          {...this.props}
          autoCorrect = { autoCorrect }
          multiline = { multiline }
          required={required}
          keyboardType= {keyboardType}
          numberOfLines={numberOfLines}
          style={inputStyles}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          min={min}
          onInputChange={inputChangeHandler}
          blurOnSubmit
          placeholderStyle={{ color: argonTheme.COLORS.BLACKS }}
          autoCompleteType={autoCompleteType}
          returnKeyType={returnKeyType}
          secureTextEntry = {secureTextEntry}
          autoCapitalize = {autoCapitalize}
          textContentType = {textContentType}
          onSubmitEditing={onSubmitEditing}
        />
      </Block>
    );
  }
}

FloatingLabelInput.defaultProps = {
    ww: false,
    small: false,
    lborder: false,
    lborders: false,
    tb: false,
  };
  
  FloatingLabelInput.propTypes = {
    ww: PropTypes.bool,
    small: PropTypes.bool,
    lborder: PropTypes.bool,
    lborders: PropTypes.bool,
    tb: PropTypes.bool,
  }

const styles = StyleSheet.create({
    defaultStyle: {
        height: 22, 
        fontSize: 20,
        fontFamily: 'regular', 
        color: argonTheme.COLORS.BLACKS,
        borderBottomWidth: .8, 
        borderBottomColor: argonTheme.COLORS.BLACKS 
    },
    lborder: {
      borderBottomColor: argonTheme.COLORS.GRADIENT_START 
    },
    lborders: {
      borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
      borderBottomWidth:StyleSheet.hairlineWidth, 
    },
    rInput: {
        width: Util.width - theme.SIZES.BASE * 2
    },
    small: {
        width: '100%',
        paddingTop: Util.androidPhone ? 24 : 19,
        paddingBottom:1.5
    },
    noBorder: {
      borderBottomWidth: 0,
      borderColor:'transparent'
    },
    thinBorder:{
      borderBottomWidth:StyleSheet.hairlineWidth,
    }
})


export default FloatingLabelInput;


