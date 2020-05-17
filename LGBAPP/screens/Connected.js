import React from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Image, TouchableOpacity,
  ImageBackground,
  Platform
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as profileActions from '../store/actions/editProfile';
import { Button, Spinner, EmptyList } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import { Odb } from "../actionable";

const { width, height } = Dimensions.get("screen");

const sample = [
  {_id:'001a', mutual:true, accepted: true, connection:{_id:'5d4df4ca4827741bf97ed037', displayName:'justin2', fname:'Justin', lname:'Incase', bizname:'null', img:['uploads/2019-09-01T21:28:50.092Z-3a25f03b-158e-410c-a348-4541f83f65c5.jpg'], desc:null}}
]

class Connected extends React.Component {
  state = {
    myTotalConn: 0,
    loading: false,
    loadingInfo: null,
    error: false,
    errs: null,
    errNum: null,
    textSearchCounter: null,
    showContent:true,
    generalSearch: false,
    errWait: 0,
  }

  async componentWillMount() {
    await this.getMyConnection();
  }
  manageNumbers = data => {
    parseFloat(3.14159.toFixed(2));
    if(data >=999999999999){
      let rData = data/1000000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}T`;
    }
    else if(data >= 999999999) {
      let rData = data/1000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}B`;
    }
    else if(data >= 999999) {
      let rData = data/1000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}M`;
    }
    else if(data >= 999) {
      let rData = data/1000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}K`;
    }
    else if(data <= 999) {
      return data;
    }
  }

  getMyConnection = async() => {
    const { token, prefillConnections, allConnected, totalConnected, connectionsPager } = this.props;
    let pager;
    if(allConnected.length > 0) {
      this.setState({loading:false, loadingInfo:null, isOverlayVisible: totalConnected === 0 ? true: false}, () => {
        this.props.navigation.setParams({ 
          navHeaderFunction: this.navHeaderFunction,
          navHeaderSearchLabel: 'Search following',
          searchFunction: this.searchUser,
        });
      });
      this.navHeaderTitle();
      return;
    } else {
      try {
        pager = connectionsPager === 0 ? 1 : connectionsPager;
        this.setState({loading:true, error: false, loadingInfo:'...loading your following', errNum:null, errs:null})
        if(this.state.errWait > 0 ){
          setTimeout(async() => {
            await prefillConnections(token, pager);
            this.setState({loading:false, loadingInfo:null, errWait:0}, () => {
              this.props.navigation.setParams({ 
                navHeaderFunction: this.navHeaderFunction,
                navHeaderSearchLabel: 'Search following',
                searchFunction: this.searchUser
            });
          });
          this.navHeaderTitle();
          }, this.state.errWait);
        } else {
          await prefillConnections(token, pager);
          this.setState({loading:false, loadingInfo:null, errWait:0}, () => {
            this.props.navigation.setParams({ 
              navHeaderFunction: this.navHeaderFunction,
              navHeaderSearchLabel: 'Search following',
              searchFunction: this.searchUser
            });
          });
          this.navHeaderTitle();
        }
        return;
      } catch(err) {
        this.setState({loading:false, error: true, loadingInfo:null, errs:err.message, errNum:1, errWait:4500})
      }
    }
  }

  getMyConnectionLM = async() => {
    const { token, prefillConnections, connectionsPager } = this.props;
    let pager;
    try {
      this.setState({loading:true, error: false, loadingInfo:'...loading more', errNum:null, errs:null});
      if(this.state.errWait > 0 ){
        setTimeout(async() => {
          pager = connectionsPager === 0 ? 1 : connectionsPager;
          await prefillConnections(token, pager);
          this.setState({loading:false, loadingInfo:null, errWait:0})
        }, this.state.errWait)
      } else {
        pager = connectionsPager === 0 ? 1 : connectionsPager;
        await prefillConnections(token, pager);
        this.setState({loading:false, loadingInfo:null, errWait:0})
      }
      return;
    } catch(err) {
      this.setState({loading:false, error:true, loadingInfo:null, errs:err.message, errNum:2, errWait:4500})
    }
  }

  navHeaderFunction = () => {
    return this.props.navigation.navigate('Connections', {routeKey:this.props.navigation.state.routeName});
  }

  navHeaderTitle = async() => {
    const { totalConnected } = this.props;
    await this.props.navigation.setParams({headerTitle: `${this.manageNumbers(parseInt(totalConnected))} Following`});
    return;
  }

  tryAgainButton = (data) => {
    this.setState({error: false});
    if(this.state.errNum === null) {
        return;
    }
    if(this.state.errNum === 1) {
      return this.getMyConnection();
    }
    if(this.state.errNum === 2) {
      return this.getMyConnectionLM();
    }
    if(this.state.errNum === 3) {
      return this.searchUser(this.state.textSearchCounter);
    }
  }

  searchUser = async(data) => {
    const { token, searchUser, searchFollowing, searchFollowingPager, searchPager, emptySearchData } = this.props;
    if(data) {
      this.setState({textSearchCounter:data})
      if(this.state.generalSearch && data) {
        this.props.emptySearchData();
        if(data.length > 3){
          let pager;
          try {
            this.setState({loading:true, loadingInfo:`...searching for ${data}`, errNum:null, errs:null}, () => {
              this.props.navigation.setParams({headerTitle: `Search All Users`});
            })
            if(this.state.errWait > 0 ){
              setTimeout(async() => {
                pager = searchPager === 0 ? 1 : searchPager;
                await this.props.searchUser(token, pager, data);
                return this.setState({loading: false, loadingInfo: null, errWait:0});
              }, this.state.errWait);
            } else {
              pager = searchPager === 0 ? 1 : searchPager;
              await this.props.searchUser(token, pager, data);
              return this.setState({loading: false, loadingInfo: null, errWait:0}); 
            }
          }catch(err) {
            console.log(err)
            if(err.status === 422) {
              return this.setState({loading:false, loadingInfo:null});
            }
            return this.setState({loading:false, error:true, loadingInfo:null, errs:err.message, errNum:3, errWait:4500});
          }
        }
      }
      if(!this.state.generalSearch && data){
        if(data.length > 3){
          console.log('mami')
          let pager;
          try {
            this.setState({loading:true, loadingInfo:`...searching for ${data}`, errNum:null, errs:null});
            await this.props.navigation.setParams({headerTitle: `Searching Following`});
            if(this.state.errWait > 0 ){
              setTimeout(async() => {
                pager = searchFollowingPager === 0 ? 1 : searchFollowingPager;
                await searchFollowing(token, pager, data); 
                return this.setState({loading: false, loadingInfo: null, errWait:0});
              }, this.state.errWait);
            } else {
              pager = searchFollowingPager === 0 ? 1 : searchFollowingPager;
              await searchFollowing(token, pager, data); 
              return this.setState({loading: false, loadingInfo: null, errWait:0});
            }
          }catch(err) {
            console.log(err)
            if(err.status === 422) {
              returnthis.setState({loading:false, loadingInfo:null});
            }
            return this.setState({loading:false, error:true, loadingInfo:null, errs:err.message, errNum:3, errWait:4500});
          }
        }
      }
    }
    if(!data || data.length === 0){
      this.setState({loading:false, textSearchCounter:null});
      await emptySearchData(); 
      return;
    } 
  }

  passPropsAction = async(item) => {
    const stateData = new Object();
    stateData.connectionConnectItem = item;
    stateData.showContentConnections = this.state.showContent;
    stateData.searchDataG = this.state.showContent? null : this.state.textSearchCounter;
    stateData.searchDataF = this.state.showContent? this.state.textSearchCounter : null;
    stateData.routeKey = this.props.navigation.state.routeName;
    try {
      await this.props.managedProfileStates(stateData);
      // return this.props.navigation.navigate('Myself', params={ anotherUser: 'true' });
      return this.props.navigation.navigate('Myself');
    }catch(err){
      console.log(err)
    }
  }

  renderItem = ({ item }) => {
    let items = item.connector !== undefined ? item.connector :!item.connection !== undefined && item.connection;
    items = !items ? item : items;
    return(
      <ListItem
        title={`${items.fname} ${items.lname}`}
        subtitle={items.bizname ==='null'?items.displayName : items.bizname}
        leftAvatar={{ source:{ uri: Odb.dbUrl+items.img[0] } }}
        bottomDivider
        chevron
        style={{width: width - theme.SIZES.BASE*2}}
        onPress={() => this.passPropsAction(items)}
        rightIcon= {
          !items.bizname || items.bizname ==='null' ? null:
          <SimpleLineIcons
            name='user-following'
            size={18}
            color={argonTheme.COLORS.GRADIENT_START}
        />}
      />
    )
  }


  render() {
    const { totalConnected  } = this.props
    return (
      <Block flex style={styles.profile}>
        {
          this.state.loading ?
          <Block center style={{ width:width, position:'absolute', top: Platform.OS==='android' ? 60 : 1, zIndex:100051, height:theme.SIZES.BASE*2 }}>
            <Spinner color={argonTheme.COLORS.GRADIENT_START} label={this.state.loadingInfo} textColor={argonTheme.COLORS.GRADIENT_START}/></Block>:null
        }
        {
          this.state.error ?
          <Block center style={styles.errContainer}>
            <Block style={styles.errTextBlock}>
              <Text size={13} style={styles.errText}>{this.state.errs}</Text>
            </Block>
            <Button small shadowless style={styles.errBtn} onPress={this.tryAgainButton}>
              <Block row space="between">
                  <Text style={styles.textFont} size={14} color={ Platform .OS==='android' ? 'white' : argonTheme.COLORS.PRIMARY}> Try Again!</Text>
              </Block>
            </Button>
          </Block>
          :null
        }
        <Block flex>
          <ImageBackground
            source={Images.ProfileBackground}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <Block middle style={{ flex: 1, width, height:(height-(theme.SIZES.BASE*2)), zIndex: 50, }}>
                <Block flex={0.8} style={styles.profileCard}>
                  {Platform.OS==='android' ? 
                    <Block flex={0.17}>
                    </Block>:
                    <Block flex={0.02}>
                    </Block>
                  }
                  <Block flex={Platform.OS==='android' ? 0.9: 0.9} style={{width:width, marginBottom:Platform.OS==='android'?theme.SIZES.BASE*1.5:null}}>
                    <FlatList
                      extraData={this.props.searchedUsers || this.props.followingSearch || this.props.allConnected}
                      style={{flex:1, width: width - theme.SIZES.BASE*2}}
                      alwaysBounceHorizontal={true}
                      showsVerticalScrollIndicator={false}
                      horizontal={false}
                      ListEmptyComponent={<EmptyList x='No Following' />}
                      data={this.state.showContent ? this.props.followingSearch.length > 0 ?this.props.followingSearch:this.props.allConnected: this.props.searchedUsers}
                      // data={this.state.showContent ? this.props.followingSearch.length > 0 ? this.props.followingSearch:sample: this.props.searchedUsers}
                      keyExtractor={pp => pp._id}
                      renderItem={this.renderItem}
                    /> 
                  </Block>
                </Block>
                <Block flex={0.2}>
                </Block>
            </Block>
          </ImageBackground>
        </Block>
        <Block center row style={{position: 'absolute', bottom: 10, right:5, zIndex:9000}}>
            <TouchableOpacity shadowless={true} onPress={() => this.setState({showContent: !this.state.showContent, generalSearch: !this.state.generalSearch}, () => {
              this.state.generalSearch ? this.props.navigation.setParams({headerTitle:'Search All User', navHeaderSearchLabel: 'Search for new connections...'}):
              this.props.navigation.setParams({headerTitle: `${this.manageNumbers(parseInt(totalConnected))} Following`, navHeaderSearchLabel: 'Search following'})
            })}
                style={{height:60,width:60,borderRadius:30, backgroundColor:argonTheme.COLORS.GRADIENT_START, alignItems:'center',overflow:"hidden" }}>
                <Block style={{height:60,width:60,borderRadius:30, alignItems:'center', justifyContent:'center'}}>
                  <MaterialCommunityIcons
                    name='account-search'
                    size={26}
                    color={argonTheme.COLORS.INFO}
                    />
                  <Text style={{fontFamily: 'bold', fontSize:12, color:argonTheme.COLORS.INFO}}>New</Text>
                </Block>
            </TouchableOpacity>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
    zIndex: 0
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  profileCard: {
    marginTop: -14.5,
    borderRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
    elevation: 5,
    width: width - theme.SIZES.BASE*2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: 'auto',
    borderRadius: 6,
    height: 50,
    elevation: 0,
    marginBottom: 2, 
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: theme.SIZES.BASE,
    overflow:"hidden"
  },
  errContainer: { 
    width:(width/2)*1.5, 
    position:'absolute', 
    top: Platform.OS==='android' ? 100 : 10, 
    backgroundColor:'rgba(244,239,249,0.8)', 
    borderWidth:StyleSheet.hairlineWidth,
    borderColor:argonTheme.COLORS.GREY, 
    zIndex:100051, 
    height: 80,
    justifyContent:'center',
    alignItems:'center'
  },
  errBtn:{
    // width: theme.SIZES.BASE * 8,
    flex:0.5,
    marginBottom: 4,
    backgroundColor: Platform.OS === "android" ? argonTheme.COLORS.SUCCESS : 'transparent'
  },
  errText: { 
    fontFamily:'regular', 
    color: argonTheme.COLORS.ERROR, 
  },
  errTextBlock: {
    width: (width/2)*1.5,
    paddingHorizontal: 10,
    paddingVertical: 10, 
    flex: 0.5, 
    marginBottom:5,
    alignItems:'center',
    justifyContent:'center'
  },
});

const mapStateToProps = function(state) {
  return {
    rProfile: state.profile.profile,
    token: state.profile.userToken,
    searchedUsers: state.profile.searchedUsers,
    totalUserFound: state.profile.totalUserFound,
    allConnected: state.profile.allConnected,
    totalConnected: state.profile.totalConnected,
    followingSearch: state.profile.followingSearch,
    totalFollowingSearch: state.profile.totalFollowingSearch,
    connectionsPager:state.profile.connectionsPager,
    searchFollowingPager: state.profile.searchFollowingPager,
    searchPager: state.profile.searchPager,
  }
}

export default connect(mapStateToProps, profileActions)(Connected);