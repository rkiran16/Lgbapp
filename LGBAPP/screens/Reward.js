import React from 'react';
import { StyleSheet, StatusBar, Dimensions, Platform, Alert, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as profileActions from '../store/actions/editProfile';
import * as ordersAction from '../store/actions/orders';
import { Block, Text, theme } from 'galio-framework';
import { Image } from 'react-native-elements';
import { Services } from "../actionable";
import { Images, argonTheme } from '../constants/';
import { InsideContainer } from "../components/";
import { HeaderHeight } from "../constants/utils";


const { width } = Dimensions.get('screen');
const date = new Date();
const timestamp = Math.floor(date.getTime()/1000);
const myList = [
  {_id:'001a', for:{img:['https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?fit=crop&w=1650&q=80'],title:'Testing 1'},point:0.01,usage:0, bal:0.01 }
]


class Reward extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      rewardPager: 1,
      loading: false
    }
  }
  async componentDidMount() {
    this.props.navigation.setParams({ 
      navHeaderFunction: this.navHeaderFunction,
    });
    await this.checkProfileName();
    return this.loadReward();
  }

  loadReward = async() => {
    try{
      await this.props.ordersAction.fetchRewards(this.state.rewardPager);
    }catch(err){
      return Services.allAlert(Alert,'Error', "Couldn't update reward", 'Try Again', 'default', this.loadReward, true);
    }
  }

  checkProfileName = () => {
    const { lname } = this.props.rProfile;
    if(!lname) {
      return this.props.profileActions.fetchUser();
    }
  }
  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Orders');
  }
  rewardCardNumber = () => {
    const rNum = '654321'.concat('', timestamp.toString());
    let stNum = `${rNum.substring(0, 4)} ${rNum.substring(4, 8)} ${rNum.substring(8, 12)} ${rNum.substring(12, 16)}`;
    return stNum;
  }
  render() {
    const { lname, fname } = this.props.rProfile;
    return (
      <Block flex style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Block flex style={{marginTop: Platform.OS === 'android' ? HeaderHeight : 0,}}>
            <Block style={{justifyContent:'center', alignItems:'center', width, height: 260, ...styles.shadow }}>
              <TouchableOpacity onPress={this.loadReward}>
              <Image
                  resizeMode="contain"
                  source={Images.RewardCard}
                  style={{ width: (width-(theme.SIZES.BASE*1.5)), flex:1}}
              />
              </TouchableOpacity>
            <Block style={styles.padded}>
              <Block style={{marginBottom:10}}>
                <Text style={{...styles.points, fontSize:30, color:'#cecece'}}>{this.rewardCardNumber()}</Text>
              </Block>
              <Block style={{marginBottom: 5, marginLeft: Platform.OS === 'android' ? 120 : 88}}>
                <Text style={{fontFamily:'bold', fontSize:16, color:'white'}}>{`${fname} ${lname}`}</Text>
              </Block>
            </Block>
            </Block>
            <Block flex={1}>
              <InsideContainer rewards myList={this.props.rewards} myReward={this.props.totalAvailableRewards} refreshing={this.state.loading} extra={this.props} loadMore={this.loadReward}/>
            </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE,
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  pointLabel: {
    fontFamily:'regular',
    fontSize: 12,
    color: argonTheme.COLORS.GRADIENT_END
  },
  points: {
    fontFamily:'bold',
    fontSize: 48,
    color: argonTheme.COLORS.GRADIENT_END
  },
  padded: {
    position:'absolute',
    flex:1, 
    overflow:"hidden",
    bottom: Platform.OS === 'android' ? 33 : 42,
    right: theme.SIZES.BASE*3.5
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
    backgroundColor:argonTheme.COLORS.GRADIENT_END
  },
});
const mapStateToProps = function(state) {
  return {
    rProfile: state.profile.profile,
    rewards: state.orders.rewards,
    totalAvailableRewards: state.orders.totalAvailableRewards
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    profileActions: bindActionCreators(profileActions, dispatch),
    ordersAction: bindActionCreators(ordersAction, dispatch)
  }
}

export default  connect(mapStateToProps, mapDispatchToProps)(Reward);
