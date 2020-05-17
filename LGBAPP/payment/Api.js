import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Block, Text } from "galio-framework";
import { argonTheme } from "../constants/";
import PaymentFormView from './PaymentFormView';

/**
 * The class renders a view with PaymentFormView
 */
export default class AddSubscriptionView extends React.Component {
  render() {
    const { total } = this.props.data;
    return (
      <Block center middle style={styles.container}>
          <Block style={styles.textWrapper}>
            <Text style={styles.infoText}>
              {`Cart Total: ${total}`}
            </Text>
          </Block>
          <Block style={styles.cardFormWrapper}>
            <PaymentFormView {...this.props}/>
          </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent:'center'
  },
  textWrapper: {
    margin: 10
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    color: argonTheme.COLORS.GRADIENT_START,
    fontFamily: 'bold'
  },
  cardFormWrapper: {
    padding: 10,
    margin: 10
  }
});