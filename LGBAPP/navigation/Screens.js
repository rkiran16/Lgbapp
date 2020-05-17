import React from "react";
import { Easing, Animated, Text, Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import { Block } from "galio-framework";
import {  Icon } from '../components';
import { argonTheme } from '../constants'

// screens
import Dashboard from "../screens/Home";
import Onboarding from "../screens/Onboarding";
import Postings from "../screens/Post";
import Rewards from "../screens/Reward";
import EditProfile from "../screens/EditProfile";
import Pro from "../screens/Pro";
import Chat from "../screens/Chat";
import ChatText from "../screens/ChatText";
import Profile from "../screens/Profile";
import VProfile from "../screens/ViewUser";
import Register from "../screens/Register";
import Elements from "../screens/Elements";
import Order from "../screens/Order";
import CatSelect from "../screens/CatSelect";
import Category from "../screens/Category";
import Saved from "../screens/Saved";
import Settings from "../screens/Settings";
import CatOption from "../screens/CatOption";
import Upload from "../screens/Upload";
import Welcome from "../screens/Welcome";
import Connected from "../screens/Connected";
import Connections from "../screens/Connections";
import MapSearch from '../screens/MapSearch';
import Shop from '../screens/Shop';
import Product from '../screens/Product';

// drawer
import Menu from "./Menu";
import DrawerItem from "../components/DrawerItem";

// header for screens
import Header from "../components/Header";

const transitionConfig = (transitionProps, prevTransitionProps) => ({
  transitionSpec: {
    duration: 10,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing
  },
  screenInterpolator: sceneProps => {
    const { layout, position, scene } = sceneProps;
    const thisSceneIndex = scene.index;
    const width = layout.initWidth;

    const scale = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [4, 1, 1]
    });
    const opacity = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [0, 1, 1]
    });
    const translateX = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0]
    });

    const scaleWithOpacity = { opacity };
    const screenName = "Search";

    if (
      screenName === transitionProps.scene.route.routeName ||
      (prevTransitionProps &&
        screenName === prevTransitionProps.scene.route.routeName)
    ) {
      return scaleWithOpacity;
    }
    return { transform: [{ translateX }] };
  }
});


const ElementsStack = createStackNavigator({
  Elements: {
    screen: Elements,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Elements" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  transitionConfig
});

// Complete Profile
const EditProfileStack = createStackNavigator(
  {
    EditProfile: {
      screen: EditProfile,
      navigationOptions: ({ navigation }) => ({
        headerTransparent: true
      })
    },
    CatSelect: {
      screen: CatSelect,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header blue title="Interests Options" back navigation={navigation} />
        ),
      })
    },
    Upload: {
      screen: Upload,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    }
  },
  {
    cardStyle: { backgroundColor: "#FFFFFF" },
    transitionConfig,
    lazyload: true
  }
);

//Profile
const ProfileStack = createStackNavigator(
  {
    Myself: {
      screen: Profile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header white transparent title="Myself" iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    },
    Connections: {
      screen: Connections,
      navigationOptions: ({ navigation }) => ({
        header: <Header search moreOptions title="Followers" iconColor={argonTheme.COLORS.GRADIENT_START} back navigation={navigation} />
      })
    },
    Connected: {
      screen: Connected,
      navigationOptions: ({ navigation }) => ({
        header: <Header search moreOptions title="Following" iconColor={argonTheme.COLORS.GRADIENT_START} back navigation={navigation} />
      })
    }
  },{
    cardStyle: {
      backgroundColor: "#F8F9FE"
    },
    transitionConfig,
  });

//ViewUser Profile
const VProfileStack = createStackNavigator(
  {
    Myself: {
      screen: VProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header white transparent iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    }
  },
  {
    cardStyle: { backgroundColor: "#FFFFFF" },
    transitionConfig
  }
);

//Posting Screen
const PostingStack = createStackNavigator(
  {
    Posting: {
      screen: Postings,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header white transparent title="My Postings" iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    }
  },
  {
    cardStyle: { backgroundColor: "#FFFFFF" },
    transitionConfig
  }
);

const OrderStack = createStackNavigator({
  Orders: {
    screen: Order,
    navigationOptions: ({ navigation }) => ({
      header: <Header tabs={tabs.order} title="Orders" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  // transitionConfig
});

const SavedStack = createStackNavigator({
  SavedItem: {
    screen: Saved,
    navigationOptions: ({ navigation }) => ({
      header: <Header search title="Saved Items" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  // transitionConfig,
});

const RewardStack = createStackNavigator({
  Rewards: {
    screen: Rewards,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Rewards" navigation={navigation} 
      bgColor={Platform.OS === 'android' ? argonTheme.COLORS.GRADIENT_START : null}  
      iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}/>,
    }) 
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  // transitionConfig,
});

const CatOptionStack = createStackNavigator({
  CatOption: {
    screen: CatOption,
    navigationOptions: ({ navigation }) => ({
      header: <Header search moreOptions title="Category Option" navigation={navigation} 
      bgColor={Platform.OS === 'android' ? argonTheme.COLORS.GRADIENT_END: null}  
      iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}/>
    })  
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  transitionConfig,
});

const ShopStack = createStackNavigator({
  Shop: {
    screen: Shop,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Market" navigation={navigation} 
      bgColor={Platform.OS === 'android' ? argonTheme.COLORS.BLUE: null}  
      iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}/>
    })  
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  transitionConfig,
});

const ChatStack = createStackNavigator({
  Chat: {
    screen: Chat,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Chat" navigation={navigation}  />
    })  
  },
  ChatText: {
    screen: ChatText,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header transparent iconColor={argonTheme.COLORS.ACTIVE} titleColor='#999999' title='Chat' back navigation={navigation} />
      ),
      headerTransparent: true
    })  
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  transitionConfig,
});

const SettingStack = createStackNavigator({
  Settings: {
    screen: Settings,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header transparent title="Settings" navigation={navigation} 
        bgColor={Platform.OS === 'android' ? argonTheme.COLORS.BLUE: null}  
        iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}/>
      ),
      headerTransparent: true
    })
  }
},{
  cardStyle: {
    backgroundColor: "#F8F9FE"
  },
  transitionConfig,
});

//Onboarding
const OnboardStack = createSwitchNavigator({
  Onboarding: {
    screen: Onboarding,
  },
  Welcome: {
    screen: Welcome,
  }
})

const DashStack = createStackNavigator({
    Dashboard: {
      screen: Dashboard,
      navigationOptions: ({ navigation }) => ({
        header: <Header search title="Dashboard" navigation={navigation} 
        // bgColor={Platform.OS === 'android' ? argonTheme.COLORS.GRADIENT_START : null}  
        // iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}
        />,
      }) 
    },
    Pro: {
      screen: Pro,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Promotions" navigation={navigation} 
        // bgColor={Platform.OS === 'android' ? argonTheme.COLORS.GRADIENT_START : null}  
        // iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}
        />,
      }) 
    },
    Product: {
      screen: Product,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header transparent title={navigation.getParam('headName', 'Product')} back navigation={navigation}  
          iconColor={argonTheme.COLORS.GRADIENT_END} titleColor={argonTheme.COLORS.GRADIENT_END}/>
        ),
        headerTransparent: true
      })
    },
    Categories: {
      screen: Category,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title={navigation.getParam('headName', 'Category')} back navigation={navigation} 
          // bgColor={Platform.OS === 'android' ? argonTheme.COLORS.GRADIENT_START : null}  
          // iconColor={Platform.OS === 'android' ? 'white': null} white={Platform.OS === 'android' ? 'white':null}
          />
        ),
      })
    },
    MapSearch: {
      screen: MapSearch,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header transparent search back title="Map" navigation={navigation} iconColor={argonTheme.COLORS.GRADIENT_END} titleColor={argonTheme.COLORS.GRADIENT_END}/>
        ),
        headerTransparent: true
      })
    }
  },{
    cardStyle: {
      backgroundColor: "#F8F9FE"
    },
    transitionConfig,
  });

//BottomTabconfig
const tabScreenConfig ={
  Dashboard: {
    screen: DashStack,
    navigationOptions: {
      tabBarIcon: tabInfo => {
        return (
          <Icon size={25} name="shop" family="ArgonExtra" color={tabInfo.tintColor} />
        );
      },
      tabBarColor: argonTheme.COLORS.GRADIENT_START,
    }
  },
  Market: {
    screen: ShopStack,
    navigationOptions: {
      tabBarIcon: tabInfo => {
        return (
          <Icon size={25} name="bag-17" family="ArgonExtra" color={tabInfo.tintColor} />
        );
      },
      tabBarColor: argonTheme.COLORS.BLUE,
    }
  },
  Post: {
    screen: PostingStack,
    navigationOptions: {
      tabBarIcon: tabInfo => {
        return (
          <Icon size={26} name="filter-center-focus" family="MaterialIcons" color={tabInfo.tintColor} />
        );
      },
      tabBarColor: argonTheme.COLORS.GRADIENT_START,
      tabBarLabel: null
    }
  },
  Category: {
    screen: CatOptionStack,
    navigationOptions: {
      tabBarIcon: tabInfo => {
        return (
          <Icon size={25} name="layers" family="Feather" color={tabInfo.tintColor} />
        );
      },
      tabBarColor: argonTheme.COLORS.GRADIENT_END,
    }
  },
  Settings: {
    screen: SettingStack,
    navigationOptions: {
      tabBarIcon: tabInfo => {
        return (
          <Icon size={25} name="md-settings" family="Ionicon" color={tabInfo.tintColor} />
        );
      },
      tabBarColor: argonTheme.COLORS.BLUE
    }
  },
}


//Bottom Tab Navigator
const LGBBottomTab = 
// Platform.OS === 'android'
//   ? createMaterialBottomTabNavigator(tabScreenConfig,
//     {
//       inactiveTintColor: argonTheme.COLORS.WHITE,
//       activeTintColor: argonTheme.COLORS.WHITE,
//       shifting: true,
//       barStyle: {
//         backgroundColor: argonTheme.COLORS.WHITE,
//       },
//       labelStyle: {
//         fontFamily: 'regular'
//       },
//       lazyload: true
//     })
//     :
    createBottomTabNavigator(tabScreenConfig, {
      tabBarOptions: {
        labelStyle: {
          fontFamily: 'regular'
        },
        inactiveTintColor: argonTheme.COLORS.ICON,
        activeTintColor: argonTheme.COLORS.GRADIENT_START
      },
      lazyload: true
    })

// divideru se baga ca si cum ar fi un ecrna dar nu-i nimic duh
const AppStack = createDrawerNavigator(
  {
    Dashboard: {
      screen: LGBBottomTab,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Dashboard" />
        )
      })
    },
    Myself: {
      screen: ProfileStack,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Myself" />
        )
      })
    },
    ViewUser: {
      screen: VProfileStack,
      navigationOptions: navOpt => ({
        drawerLabel: () => {}
      })
    },
    SavedItem: {
      screen: SavedStack,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Saved Items" />
        )
      })
    },
    Rewards: {
      screen: RewardStack,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Rewards" />
        )
      })
    },
    Orders: {
      screen: OrderStack,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Orders" />
        )
      })
    },
    Chat: {
      screen: ChatStack,
      navigationOptions: navOpt => ({
        drawerLabel: ({ focused }) => (
          <DrawerItem focused={focused} title="Chat" />
        )
      })
    },
    // EditProfile: {
    //   screen: EditProfileStack,
    //   navigationOptions: {
    //     drawerLockMode: 'locked-closed',
    //     drawerLabel: () => {}
    //   }
    // },
    
  }, 
  Menu
);

const AppContainer = createAppContainer(createSwitchNavigator({
  Onboarding: {
    screen: OnboardStack,
    lazyload: true
  },
  Account: {
    screen: Register,
    lazyload: true
  },
  CompleteProfile: {
    screen: EditProfileStack,
    lazyload: true
  },
  AppStack,
},
{
  initialRouteName: 'Onboarding',
}
));

export default AppContainer;
