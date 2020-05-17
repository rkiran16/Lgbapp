
import React, { useCallback } from "react";
import { ScrollView, Platform, StyleSheet, Dimensions } from "react-native";
// Galio components
import { Block, Text, Button as GaButton, theme } from "galio-framework";
// Argon themed components
import { argonTheme, Util  } from "../constants/";
import { Button, Switch, Spinner } from "../components/";
import * as profileActions from '../store/actions/editProfile';
import { connect, useSelector, useDispatch } from 'react-redux';

const { width, height } = Dimensions.get("screen");

class CategorySelection extends React.Component {
  
  state = {
    loading: false,
    option:null,
    selection:[],
    formData: null,
    loadingInfo: 'loading interest...',
    error: false,
    errs: null
  };

  async componentDidMount() {
    await this._getData();
  }

  _getData = async () => {
    this.setState({loading: true});
    const category = await this.props.navigation.getParam('category', null);
    const data = await this.props.navigation.getParam('formData', null);
    if(category.length > 0){
      this.setState({option:category, formData:data});
    }
    this.setState({loading:false});
  }

  signOut = () => {

  }

  submitForm = async() => {

    this.setState({loading: true, loadingInfo: 'Submitting your Info...'});
    let interest;
    this.state.selection.length > 0 ? interest=this.state.selection : interest = this.state.option;
    try {
      await this.props.updateUser(this.state.formData, interest);
      await this.setState({loading: false});
      this.props.navigation.navigate('Dashboard');
    }catch(erros) {
      this.setState({loading: false, error: true, errs: erros.message});
    }
  }

  toggleButton = (id, value) => {
    if(id){
      const index = this.state.selection.findIndex(x => x._id ===id);
      if (index > -1) {
        this.state.selection.splice(index, 1);
      }else if(index === - 1 && id) {
        this.state.selection.push(value);
      }
    }
    if(this.state.selection.length > 0) {
      return (
        <Button
          style={{borderWidth: 0, shadow: 0, elevation: 0}}
          small
          color="transparent"
          textStyle={{ color: "#5E72E4", fontSize: 16 }}
          onPress = {this.submitForm}
          >  Next
        </Button>
      ) 
    } else {
      return (
        <Button
          style={{borderWidth: 0, shadow: 0, elevation: 0}}
          small
          color="transparent"
          textStyle={{ color: "#5E72E4", fontSize: 16 }}
          onPress={this.submitForm}>
          SKIP
        </Button>
      )
    }
  }

  renderOption = (item) => {
    if(this.state.loading === false && this.state.option === null) {
      return (
        <Block center flex style={{width:width, alignItems:'center', justifyContent:'center'}}>
          <Text size={14}style={styles.textFont}>An error occurred!</Text>
          <Button
          style={{borderWidth: 0, shadow: 0, elevation: 0}}
          small
          color="transparent"
          textStyle={{ color: "#5E72E4", fontSize: 16 }}
          onPress={() => this.signOut()}>
          Try Again!
        </Button>
        </Block>
      )
    }

    if(item.length > 0) {
      return(
        <Block>
          {item.map((value) => (
          <Block style={{...styles.group}} space="between" key={`switch-${value._id}`}>
            <Block row style={{justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <Block  style={{padding:2, flexWrap: 'wrap', width:width - theme.SIZES.BASE * 10}}>
                <Text size={14} style={styles.textFont}>{value.name}</Text>
              </Block>
              <Block style={{padding:1, paddingLeft:5, borderColor:argonTheme.COLORS.GREY, borderLeftWidth:0.3 }}>
                <Switch
                  value={this.state[`switch-${value._id}`]}
                  onValueChange={() => 
                    {
                      this.toggleSwitch(`switch-${value._id}`)
                      this.toggleButton(value._id, value)
                    }}
                />
              </Block>
            </Block>
          </Block>
          ))}
        </Block>
      )
    }
  }

  toggleSwitch = switchId =>
    this.setState({ [switchId]: !this.state[switchId] });

  renderSwitches = () => {
    if(this.state.loading === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height}}>
          <Spinner label={this.state.loadingInfo} color={argonTheme.COLORS.GRADIENT_START}/>
        </Block>
      )
    }
    if(this.state.error === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height, width}}>
          <Text size={20} style={{...styles.textFont, marginBottom:5}}>{this.state.errs}</Text>
          <Button shadowless onPress={this.submitForm} style={styles.errBtn}>
            <Block row space="between">
                <Text style={styles.textFont} size={16} color={ Platform .OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
            </Block>
          </Button>
        </Block>
      )
    }
    return (
      <Block flex style={{width:width, justifyContent:'flex-start', alignItems:'flex-start'}}>
        <Block flex column style={{ paddingHorizontal: theme.SIZES.BASE }}>
          <Text
           p
           style={{ marginTop: theme.SIZES.BASE, marginBottom: theme.SIZES.BASE / 1 }}
           color={argonTheme.COLORS.DEFAULT}
          >
            Why Interest?
          </Text>
          <Text muted style={{textAlign: 'justify'}}>Selecting your interest helps LGB App filter post tailored to your need</Text>
        </Block>
        <Block row style={{justifyContent: 'space-between', paddingLeft: theme.SIZES.BASE, paddingRight: theme.SIZES.BASE,  width:width}}>
          <Block flex={1}>
            <Text
              style={{ marginTop: theme.SIZES.BASE, marginBottom: theme.SIZES.BASE / 1 }}
              color={argonTheme.COLORS.DEFAULT}
            >
                What are you interested in?
            </Text>
          </Block>
          <Block flex={1.2} style={{marginLeft: -35}}>
            <Button
              flex={1}
              style={{borderWidth: 0, shadow: 0, elevation: 0,}}
              color="transparent"
              textStyle={{ color: "#5E72E4", fontSize: 16 }}
              onPress={this.submitForm}>
              SELECT ALL
            </Button>
          </Block>
        </Block> 
        <Block flex={1} style={{ paddingHorizontal: theme.SIZES.BASE }}>
          {this.renderOption(this.state.option)}
          <Block center space='around' row style={{padding:2, flexWrap: 'wrap'}}>
            <Block>
                {this.toggleButton()}
            </Block>
            <Block>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  };

  render() {
    return (
      <Block flex center>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {this.renderSwitches()}
        </ScrollView>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  group: {
    padding: theme.SIZES.BASE/2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: argonTheme.COLORS.GRADIENT_START,
    marginBottom: theme.SIZES.BASE/2,
    width: width - theme.SIZES.BASE * 2
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2
  },
  textFont: {
    fontFamily: 'regular'
  },
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform .OS==='android' ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
});

export default connect(null,profileActions)(CategorySelection);