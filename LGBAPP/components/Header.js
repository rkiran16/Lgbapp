import React from 'react';
import { withNavigation } from 'react-navigation';
import { TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView, Image, FlatList, } from 'react-native';
import { Button, Block, NavBar, Text, theme } from 'galio-framework';
import { SearchBar } from 'react-native-elements';
import Icon from './Icon';
import Tabs from './Tabs';
import { AppSearch } from './Multiple';
import { Images, argonTheme } from '../constants';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

const BellButton = ({isWhite, style, navigation, notify}) => (
  <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate('Settings', {notify:'true'})}>
    <Icon
      family="ArgonExtra"
      size={20}
      name="bell"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
    {notify ? <Block middle style={styles.notify} /> : null }
  </TouchableOpacity>
);

const HomeButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Dashboard')}>
    <Icon
      family="Entypo"
      size={20}
      name= 'shop'
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
  </TouchableOpacity>
);

const ConnectionButton = ({isWhite, style, nav}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => {
    if(nav !==null){
      return nav();
    }
  }}>
    <MaterialCommunityIcons
      size={20}
      name= 'account-switch'
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
  </TouchableOpacity>
);

const SavedButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('SavedItem')}>
    <Icon
      family="Ionicons"
      size={20}
      name="bookmark"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
  </TouchableOpacity>
);

const BasketButton = ({isWhite, style, nav, notify}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => {
    if(nav !==null){
      return nav();
    }
  }}>
    <Icon
      family="ArgonExtra"
      size={20}
      name="basket"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
    {notify ? <Block middle style={styles.notify} /> : null }
  </TouchableOpacity>
);

const SearchButton = ({isWhite, style, navi, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => {
    if(navi !==null){
      return navi();
    }
  }}>
    <Icon
      size={20}
      family="Ionicon"
      name={navigation.state.routeName === 'Chat'?
      Platform.OS==='android' ? 'md-search':'ios-search': 
      Platform.OS==='android' ? 'md-options' : 'ios-options'}
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
  </TouchableOpacity>
);

const CreateButton = ({isWhite, style, nav}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => {
    if(nav !==null){
      return nav();
    }
  }}>
    <Icon
      size={20}
      family="Ionicon"
      name={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
      color={theme.COLORS[isWhite ? 'WHITE' : 'GRADIENT_START']}
    />
  </TouchableOpacity>
);

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchText: null,
    };
  }
  
  handleLeftPress = () => {
    const { back, navigation } = this.props;
    const routeKey = navigation.getParam('routeKey', 'Dashboard');
    const goBackLast = navigation.getParam('goBackLast', null);
    return (back ? navigation.goBack() : goBackLast ? navigation.navigate({'routeName': routeKey}) : navigation.openDrawer());
  }
  renderRight = () => {
    const { white, title, navigation, iconColor } = this.props;
    const { routeName, params } = navigation.state;
    const notifications = params && params.notifications ? params.notifications : null;
    const orderNote = params && params.orderNotifications ? params.orderNotifications : null;
    const iconClicker = params ? params.navHeaderFunction ? params.navHeaderFunction : null  : null;
    const iClicker = params ? params.navLeftHeaderFunction ? params.navLeftHeaderFunction : null  : null;

    if (title === 'Title') {
      return [
        <BellButton key='chat-title' notify={notifications} navigation={navigation} isWhite={white} />,
        <BasketButton key='basket-title' notify={orderNote} navigation={navigation} isWhite={white} />
      ]
    }

    switch (routeName) {
      case 'Dashboard':
        return ([
          <BellButton key='chat-title' notify={notifications} navigation={navigation} isWhite={white} />,
          <BasketButton notify={orderNote} style={[marginRight = '20%']} key='basket-title' nav={iconClicker} isWhite={white} />
        ]);
      case 'Shop':
        return ([
          <BasketButton key='chat-title' nav={iClicker} isWhite={white} notify={orderNote} />,
          <SearchButton style={[marginRight = '20%']} key='basket-title' navi={iconClicker} navigation={navigation} isWhite={white} />
        ]);
      case 'SavedItem':
        return ([
          <BasketButton key='basket-product' nav={iconClicker} isWhite={white} notify={orderNote}/>,
          <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
        ]);
      case 'Categories':
        return ([
          <SearchButton key='search-categories' navi={iClicker} navigation={navigation} isWhite={white} />,
          <BellButton key='bell-categories' notify={notifications} navigation={navigation} isWhite={white} />
        ]);
      case 'Posting':
        return ([
          <BellButton key='chat-categories' notify={notifications} navigation={navigation} isWhite={white} />,
          <CreateButton key='create-button' nav={iconClicker} isWhite={white} />
        ]);
      case 'Orders':
        return ([
          <SavedButton key='saved-deals' navigation={navigation} isWhite={white} />,
          <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
        ]);
      case 'Myself':
        return ([
          <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
        ]);
      case 'Chat':
        return ([
          <SearchButton key='search-chat' navi={iconClicker} navigation={navigation} isWhite={white} />,
          <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
        ]);
      case 'Connections':
          return ([
            <ConnectionButton key='create-button' nav={iconClicker} isWhite={white} />,
            <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
          ]);
      case 'Connected':
          return ([
            <ConnectionButton key='create-button' nav={iconClicker} isWhite={white} />,
            <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
          ]);
      case 'Rewards':
        return ([
          <BasketButton key='basket-search' nav={iconClicker} isWhite={white} notify={orderNote}/>,
          <HomeButton key='home-dashboard' navigation={navigation} isWhite={white} />
        ]);
      case 'Settings':
        return ([
          <BasketButton key='basket-search' nav={iconClicker} isWhite={white} notify={orderNote} />
        ]);
      case 'MapSearch':
        return ([
          <SearchButton key='search-categories' navi={iClicker} navigation={navigation} isWhite={white} />,
          <BasketButton key='basket-search' nav={iconClicker} isWhite={white} notify={orderNote}/>
        ]);
      default:
        break;
    }
  }
  renderSearch = () => {
    const { navigation } = this.props;
    const { params } = navigation.state;
    const searchLabels = params ? params.navHeaderSearchLabel ? params.navHeaderSearchLabel : 'What are you looking for?'  : 'What are you looking for?';
    const searchFunction = params ? params.searchFunction ? params.searchFunction : null : null;
    const titles = params ? params.headName ? params.headName : null  : null;
    return (
      <AppSearch val={this.state.searchText} cancel={() => this.setState({searchText:null})} placeholder={searchLabels} 
      change={value => searchFunction(value.replace(/[^a-z,A-Z,0-9]/g,''))}/>
    );
  }
  renderOtherOptions = () => {
    const dataRec = [{title: 'Title build software together', price:'$20.00', _id:'0'}, {title: 'Ethiopia Cofee', price:'$15.00', _id:'1'},{title: 'Destination Canada', price:'$1,200.00', _id:'2'},{title: 'Title build software together', price:'$20.00', _id:'3'}]
    return(
      <Block row style={styles.options}>
        <FlatList
            style={{flex: 1}}
            alwaysBounceHorizontal={true}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            data={dataRec}
            keyExtractor={pp => pp._id}
            renderItem={({item}) => (
              <TouchableOpacity style={{...styles.tab, width: width * 0.45}}>
                <Block flex={1} row middle>
                  <Block flex={0.35} middle style={styles.avatarContainer}>
                    <Image
                      source={{ uri: Images.Products["View article"] }}
                      style={styles.avatar}
                    />
                  </Block>
                  <Block flex={0.65}>
                    <Text numberOfLines={1} style={{fontSize:12, fontFamily:'regular', color: theme.COLORS.GRADIENT_START, flex:0.62 }}>{item.title}</Text>
                    <Block row flex={0.38} style={{justifyContent:'space-between'}}>
                      <Text style={{fontSize:8, fontFamily:'regular', color:'#8898AA', }}>{item.price}</Text>
                      <Text style={{fontSize:8, fontFamily:'regular', color:'red', marginLeft:-15 }}>Deals!</Text>
                    </Block>
                  </Block>
                </Block>
              </TouchableOpacity>
            )}
        /> 
      </Block>
    );
  }

  renderOptions = () => {
    const { navigation, optionLeft, optionRight } = this.props;

    return (
        <Block row style={styles.options}>
          <ScrollView
            horizontal={true}
            alwaysBounceHorizontal={true}
            pagingEnabled={true}
            decelerationRate={0}
            scrollEventThrottle={16}
            snapToAlignment="center"
            showsHorizontalScrollIndicator={false}>
              <Button shadowless style={[styles.tab]} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon name="diamond" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.GRADIENT_START} />
                  <Text size={16} style={styles.tabTitle}>{optionLeft || 'Beauty'}</Text>
                </Block>
              </Button>
              <Button shadowless style={[styles.tab]} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon name="diamond" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.GRADIENT_START} />
                  <Text size={16} style={styles.tabTitle}>{optionLeft || 'Beauty'}</Text>
                </Block>
              </Button>
              <Button shadowless style={[styles.tab]} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon name="diamond" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.GRADIENT_START} />
                  <Text size={16} style={styles.tabTitle}>{optionLeft || 'Beauty'}</Text>
                </Block>
              </Button>
              <Button shadowless style={[styles.tab]} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon name="diamond" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.GRADIENT_START} />
                  <Text size={16} style={styles.tabTitle}>{optionLeft || 'Beauty'}</Text>
                </Block>
              </Button>
              <Button shadowless style={[styles.tab]} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon name="diamond" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.GRADIENT_START} />
                  <Text size={16} style={styles.tabTitle}>{optionLeft || 'Beauty'}</Text>
                </Block>
              </Button>
              <Button shadowless style={styles.tab} onPress={() => navigation.navigate('Pro')}>
                <Block row middle>
                  <Icon size={16} name="bag-17" family="ArgonExtra" style={{ paddingRight: 8 }} color={argonTheme.COLORS.ICON}/>
                  <Text size={16} style={styles.tabTitle}>{optionRight || 'Fashion'}</Text>
                </Block>
              </Button>
          </ScrollView>
        </Block>
    );
  }
  renderTabs = () => {
    const { tabs, tabIndex, navigation } = this.props;
    const { params } = navigation.state;
    const tabClicker = params ? params.tabClickChanges ? params.tabClickChanges : null  : null;
    const defaultTab = tabs && tabs[0] && tabs[0]._id;
    
    if (!tabs) return null;

    return (
      <Tabs
        data={tabs || []}
        initialIndex={tabIndex || defaultTab}
        onChange={_id => {
          tabClicker ? tabClicker({ tabId: _id }) : navigation.setParams({ tabId: _id })
        }} />
    )
  }
  renderHeader = () => {
    const { search, options, tabs, moreOptions } = this.props;
    if (search || tabs || options) {
      return (
        <Block center>
          {search ? this.renderSearch() : null}
          {options ? this.renderOptions() : null}
          {moreOptions ? this.renderOtherOptions() : null}
          {tabs ? this.renderTabs() : null}
        </Block>
      );
    }
  }
  
  render() {
    const { back, title, white, transparent, bgColor, iconColor, titleColor, navigation, ...props } = this.props;
    const { routeName, params } = navigation.state;
    const noShadow = ['Search', 'Categories', 'Deals', 'Pro', 'Profile'].includes(routeName);
   
    const titles = params ? params.headerTitle ? params.headerTitle : null  : null;
    const goBackLast = params ? params.goBackLast ? params.goBackLast : null  : null;

    const headerStyles = [
      !noShadow ? styles.shadow : null,
      transparent ? { backgroundColor: 'rgba(0,0,0,0)' } : null,
    ];
    const navbarStyles = [
      styles.navbar,
      bgColor && { backgroundColor: bgColor }
    ];
    return (
      <Block style={headerStyles}>
        <NavBar
          back={back}
          title={!titles ? title: titles}
          style={navbarStyles}
          transparent={transparent}
          right={this.renderRight()}
          rightStyle={{ alignItems: 'center' }}
          left={
            <TouchableOpacity onPress={this.handleLeftPress} flex={1} style={{marginLeft: -10, alignItems:'center', justifyContent:'center', height:35}}>
            <Icon 
              name={back || goBackLast ? Platform.OS === 'android' ? 'md-arrow-back': 'ios-arrow-back': Platform.OS === 'android' ? 'md-menu' : 'ios-menu'} family="Ionicon" 
              size={30}  
              color={iconColor || argonTheme.COLORS.GRADIENT_START}/></TouchableOpacity>
          }
          leftStyle={{ paddingVertical: 15, flex: 0.3 }}
          titleStyle={[
            styles.title,
            { color: argonTheme.COLORS[white ? 'WHITE' : 'GRADIENT_START'] },
            titleColor && { color: titleColor }
          ]}
          {...props}
        />
        {this.renderHeader()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 20,
    fontFamily:'bold'
  },
  titles: {
    flex: 2,
    height: height * 0.07,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navbar: {
    paddingVertical: 0,
    paddingBottom: theme.SIZES.BASE,
    // paddingTop: height >= 750 ? theme.SIZES.BASE * 2.6 : theme.SIZES.BASE * 2.3,
    paddingTop: iPhoneX ? theme.SIZES.BASE * 3 : theme.SIZES.BASE * 3,
    zIndex: 10000,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: argonTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 9,
    right: 12,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.ICON,
  },
  // search: {
  //   height: 48,
  //   width: width,
  //   borderRadius: 0,
  //   backgroundColor:'rgba(107,36,170,0.1)',
  // },
  options: {
    marginBottom: 10,
    marginTop: 10,
    elevation: 4,
  },
  opt: {
    height: '1%'
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.35,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '400',
    color: argonTheme.COLORS.GRADIENT_START
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 0
  },
});

export default withNavigation(Header);
