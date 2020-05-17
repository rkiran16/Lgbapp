import React from 'react';
import { StyleSheet, Button } from 'react-native';
import { CreditCardInput } from 'react-native-credit-card-input';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Block, Text} from "galio-framework";
import { argonTheme } from "../constants/";

/**
 * Renders the payment form and handles the credit card data
 * using the CreditCardInput component.
 */
export default class PaymentFormView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { cardData: { valid: false } };
  }

  componentDidMount(){
    this._post();
  }

  _post = () =>{
    const { card, user, billing } = this.props;
    if(!card){
      return;
    }
    let year = card.expiryY;
    if(year.length > 2){
      year = `${year[2]}${year[3]}`
    }
    return this.CCInput.setValues({ number: card.number, cvc: card.cvv, expiry:`${card.expiryM}/${year}`, postalCode:billing.zip, name:`${user.firstName} ${user.lastName}` });
  }

  render() {
    const { onSubmit, submitted, error } = this.props;

    return (
      <Block>
        <Block>
          <CreditCardInput requiresName onChange={(cardData) => this.setState({ cardData })}
          ref={(c) => this.CCInput = c}
          requiresPostalCode
          labelStyle={{fontFamily:'bold', color:argonTheme.COLORS.PLACEHOLDER}}
          inputStyle={{fontFamily:'regular', color:argonTheme.COLORS.GRADIENT_START, fontSize:15}}
          inputContainerStyle = {{borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: argonTheme.COLORS.GRADIENT_END}}
          />
        </Block>
        <Block style={styles.buttonWrapper}>
          <Button
            title='Confirm Payment'
            titleStyle = {{fontFamily:'bold', fontSize: 20, color:argonTheme.COLORS.GRADIENT_END}}
            type="outline"
            disabled={!this.state.cardData.valid || submitted}
            buttonStyle={{borderColor:argonTheme.COLORS.GRADIENT_END}}
            onPress={() => onSubmit(this.state.cardData)}
            icon={
            <MaterialCommunityIcons
                name='check'
                size={28}
                color={argonTheme.COLORS.GRADIENT_END}
                style={{marginRight:15}}
            />
            }
          />
          {/* Show errors */}
          {error && (
            <Block style={styles.alertWrapper}>
              <Block style={styles.alertIconWrapper}>
                <FontAwesome name="exclamation-circle" size={20} style={{ color:argonTheme.COLORS.INPUT_ERROR}} />
              </Block>
              <Block style={styles.alertTextWrapper}>
                <Text style={styles.alertText}>{error}</Text>
              </Block>
            </Block>
          )}
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  buttonWrapper: {
    padding: 10,
    zIndex: 100
  },
  alertTextWrapper: {
    flex: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertIconWrapper: {
    padding: 5,
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertText: {
    color: argonTheme.COLORS.INPUT_ERROR,
    fontSize: 16,
    fontFamily:'regular'
  },
  alertWrapper: {
    backgroundColor: argonTheme.COLORS.DEFAULT,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 5,
    paddingVertical: 5,
    marginTop: 10
  }
});