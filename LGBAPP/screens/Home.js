import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Image, Platform, Alert } from 'react-native';
import { Button, Block, theme, Text } from 'galio-framework';
import * as dash from '../store/actions/dashboard';
import * as postActions from '../store/actions/posting';
import * as profileActions from '../store/actions/editProfile';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Services, Ldb } from '../actionable';
import { Card, Icon, CatMenu, Spinner, Video as Videos } from '../components';
import Thumbnails from "../components/Thumbnail";
import { Images, argonTheme } from "../constants";
import articles from '../constants/articles';



const { height, width } = Dimensions.get('screen');
const androidPhone = () => Platform.OS === 'android';
const thumbMeasure = (width - 48 - 32) / 3;
const THRESHOLD = 100;
const enable = "volume-up"
const disable = "volume-off"

class Dashboard extends React.Component {
  _isMounted = false;
  constructor(){
    super();
    this.state = {
      notifications:null,
      errWait: 0,
      album: `http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4`,
      play: false,
      startOver: 1000,
      sound:enable,
      sounding: true,
      page: 1,
      loading: false,
      inloading: false,
      error: false,
      errs: null
    };
    this.position = {
      start: null,
      end: null,
    };
    this.socketRetry = this.socketRetry.bind(this);
    this.socketUpdate = this.socketUpdate.bind(this);
    this.fetchMyData = this.fetchMyData.bind(this);
    this._handleRecievedNotifications = this._handleRecievedNotifications.bind(this);
    this.getNotification = this.getNotification.bind(this);
    this.searchItem = this.searchItem.bind(this);
    this.notificationServices = this.notificationServices.bind(this);
    this.navHeaderFunction = this.navHeaderFunction.bind(this);
    this.videoSound = this.videoSound.bind(this);
    this.handleVideoLayout = this.handleVideoLayout.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.renderOption1 = this.renderOption1.bind(this);
    this.renderArticles = this.renderArticles.bind(this);
    this.addNewMessage = this.addNewMessage.bind(this);
  }

  async componentWillMount() {
    this._isMounted = true
    await this.notificationServices();
    if(this._isMounted = true){
      this.props.navigation.setParams({ 
        navHeaderFunction: this.navHeaderFunction,
        navHeaderSearchLabel: 'Search items on LGB',
        searchFunction: this.searchItem,
        // notifications: this.state.notifications
      })
    }
    await this.fetchMyData();
    return await this.socketUpdate();
    
  }

  async componentDidMount() {
    await this._handleRecievedNotifications();
    return await this.getNotification();
  }

  async componentDidUpdate(prevProps) {
    if(this.props.socket_updateUser !== prevProps.socket_updateUser){
     this.newConnectionDisplay();
    }
    if(this.props.socket_newUser !== prevProps.socket_newUser){
      this.newConnectionDisplay();
    }
    if(this.props.newText !== prevProps.newText){
      this.addNewMessage();
    }
    return;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  newConnectionDisplay = () => {
    if(!this.props.socket_newUser){
      return;
    }
    return Services.allAlert(Alert,'Connect Option',`Someone will like to connect with you`, 'Go', 'default', this.gotoProfile, false);
  }


  gotoProfile = () => {
    return this.props.navigation.navigate('Myself');
  }

  addNewMessage = () => {
    if(!this.props.newText){
      return;
    }
    return Services.allAlert(Alert,'New Message',`${this.props.newText}`, 'Ok', 'default', null, false);
  }

  socketUpdate = async() => {
    try{
      await this.props.dash.updateSocket();
      return
    }catch(err){
      return Services.allAlert(Alert,'Error', `Internet connection error`, 'Try Again', 'destructive', this.socketRetry, false);
    }
  }

  socketRetry = () => {
    return this.props.navigation.navigate('Onboarding');
  }

  _handleRecievedNotifications = async() => {
    return Services.handleNotifications();
  }
  getNotification = async() => {
    const notifications = await Services.checkNotification();
    if(!notifications) {
        return
    }
    return this.props.navigation.setParams({ notifications });
  }

  searchItem = (data) => {
    // console.log(data)
  }

  notificationServices = async () => {
    try {
      await Services.pushToken();
    } catch(err) {
      console.log(err)
    }
  }

  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Orders')
  }

  fetchMyData = async() => {
    this.setState({loading:true, error: false});
    try {
      if(this.state.errWait > 0 ){
        setTimeout(async() => {
          await this.props.dash.fetchData(this.state.page);
          if(this._isMounted === true){
            this.setState({inloading:false, loading: false, page: this.state.page+1, errWait: 0});
          }
          return;
        }, this.state.errWait)
      } else {
        await this.props.dash.fetchData(this.state.page);
        if(this._isMounted === true){
          this.setState({inloading:false, loading: false, page: this.state.page+1, errWait: 0});
        }
        return;
      }
    }catch(err) {
      if(err.status === 429) {
        if(this._isMounted === true){
          return this.setState({errWait: 4500,inloading: false, loading: false, error: true, errs: err.message});
        }
      }
      if(this._isMounted === true){
        this.setState({inloading: false, loading: false, error: true, errs: err.message});
      }
      return
    }
  }

  videoSound = () => {
    const {sound, sounding} = this.state
    if((sound===enable) && sounding===true && this._isMounted === true){
      this.setState({sound:disable, sounding:false})
    } else if(sound===disable && sounding===false && this._isMounted === true){
      this.setState({sound:enable, sounding:true})
    }
  }
  
  handleVideoLayout = event => {
    this.position.start = event.nativeEvent.layout.y - (event.nativeEvent.layout.height + THRESHOLD);
    this.position.end = event.nativeEvent.layout.y + 352 - (event.nativeEvent.layout.height + THRESHOLD);
  };
  

  handleScroll = e => {
    const scrollPosition = e.nativeEvent.contentOffset.y;
    const play = this.state.play;
    const { start, end } = this.position;
    if(((scrollPosition <= start) && play) || ((scrollPosition <= start) && !play)) {
      if(this._isMounted === true){
        this.setState({ play: false });
        this.setState({startOver: 10000})
      }
    }
    else if (scrollPosition > start && scrollPosition < end && !play) {
      if(this._isMounted === true){
        this.setState({ play: true });
        this.setState({startOver: 0})
      }
    } else if (
      (scrollPosition > end ) && play) {
        if(this._isMounted === true){
          this.setState({ play: false });
          this.setState({startOver: 10000})
        }
    }
  };

  renderOption1 = () => {
    return (
      <Block
        //flex
        style={{ paddingBottom: theme.SIZES.BASE * 0.05, paddingTop: theme.SIZES.BASE }}
      >
        <Text bold size={16} style={styles.title}>
          Another Category
        </Text>
        <Block style={{ marginHorizontal: theme.SIZES.BASE - 8 }}>
          <Block flex right>
            <Text
              size={12}
              color={argonTheme.COLORS.GRADIENT_END}
              onPress={() => this.props.navigation.navigate('CatOption')}
            >
              View All
            </Text>
          </Block>
          <Block
            row
            space="around"
            style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
          >
            {Images.Viewed.map((img, index) => (
              <Thumbnails imgUrl={img} key={`viewed-${img}`} theight={true} twidth={true} />
            ))}
          </Block>
        </Block>
      </Block>
    );
  };

  renderArticles = () => {
    return (
      <View style={[styles.home, justifyContent='space-around', flexDirection='column']}>
        <ScrollView centerContent
          onScroll={this.handleScroll}
          scrollEventThrottle = {18}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}>
            <CatMenu catData={this.props.catMenus} push={this.props.dash.storedSearches} />
            <Block flex>
              {/* <Block flex row>
                <Card item={articles[1]} style={{ marginRight: theme.SIZES.BASE }} shop/>
                <Card item={articles[2]} shop/>
              </Block>
              <Card item={articles[3]} horizontal shop/>
              <Block flex row>
                <ScrollView
                  horizontal={true}
                  pagingEnabled={true}
                  decelerationRate={0}
                  scrollEventThrottle={16}
                  snapToAlignment="left"
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={width * 0.54}
                  >
                  <Card item={articles[0]} style={{ marginRight: theme.SIZES.BASE, width:width * 0.5 }} shop />
                  <Card item={articles[1]} style={{ marginRight: theme.SIZES.BASE, width:width * 0.5 }} shop />
                  <Card item={articles[2]} style={{ marginRight: theme.SIZES.BASE, width:width * 0.5 }} shop/>
                  <Card item={articles[3]} style={{ width:width * 0.45 }} shop/>
                </ScrollView>
              </Block>
              <Card item={articles[4]} full shop /> */}
            </Block>

            {this.renderOption1()}
            {/* <Videos onLayout= {event => {this.handleVideoLayout(event)}}
              isMuted={this.state.sounding}
              positionMillis = {this.state.startOver}
              shouldPlay = {this.state.play}
              source = { this.state.album } 
              sound = {this.state.sound}
              onPress={this.videoSound}
            /> */}
            {/* {
              this.state.inloading ?
              <Block style={{alignItems:'center', justifyContent:'center', height: theme.SIZES.BASE*4}}>
                <Spinner label="Fetching, coming right up..." />
              </Block>
              :
              null
            } */}
        </ScrollView>
      </View>
    )
  };


  render() {
    if(this.state.loading === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height}}>
          <Spinner label="Fetching your faves..." />
        </Block>
      )
    }
    if(this.state.error === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height, width}}>
          <Text size={20} style={{...styles.textFont, marginBottom:5}}>{this.state.errs}</Text>
          <Button shadowless onPress={this.fetchMyData} style={styles.errBtn}>
            <Block row space="between">
                <Text style={styles.textFont} size={14} color={ Platform .OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
            </Block>
          </Button>
        </Block>
      )
    }
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 5
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  },
  button: {
    padding: 8,
    position: 'relative',
  },
  avatarContainer: { //delete
    position: "relative",
    marginTop: androidPhone ? 40 : 38
  },
  avatar: { //delete
    width: androidPhone ? 48 : 50,
    height: androidPhone ? 48 : 50,
    borderRadius: androidPhone ? 24 : 25,
    borderWidth: 0
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.ICON,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  title: {
    paddingBottom: theme.SIZES.BASE - 5,
    paddingHorizontal: theme.SIZES.BASE * 0.2,
    marginTop: 1,
    color: argonTheme.COLORS.GRADIENT_END,
    fontFamily: 'bold'
  },
  textFont: {
    fontFamily: 'regular'
  },
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform .OS==='android' ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
});

const mapStateToProps = function(state) {
  return {
    catMenus: state.dashboard.catMenu,
    socket_updateUser: state.dashboard.socket_updateUser,
    socket_newUser: state.dashboard.socket_newUser,
    newText: state.cart.newText,
    //loggedIn: state.auth.loggedIn
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    postActions: bindActionCreators(postActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);
