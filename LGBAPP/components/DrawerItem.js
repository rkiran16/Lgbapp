import React from "react";
import { StyleSheet, Platform } from "react-native";
import { Block, Text, theme } from "galio-framework";

import Icon from "./Icon";
import argonTheme from "../constants/Theme";


class DrawerItem extends React.Component {
  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case "Dashboard":
        return (
          <Icon
            name="shop"
            family="ArgonExtra"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Orders":
        return (
          <Icon
            name="shopping-bag"
            family="Feather"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );  
      case "Elements":
        return (
          <Icon
            name="map-big"
            family="ArgonExtra"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Saved Items":
        return (
          <Icon
            name={Platform.OS==='android'? 'md-bookmark' : 'ios-bookmark'}
            family="Ionicon"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Rewards":
        return (
          <Icon
            name="account-balance-wallet"
            family="MaterialIcons"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Chat":
        return (
          <Icon
            name={Platform.OS==='android'? 'md-chatbubbles' : 'ios-chatbubbles'}
            family="Ionicon"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Myself":
        return (
          <Icon
            name="account-circle"
            family="MaterialIcons"
            size={20}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );
      case "Account":
        return (
          <Icon
            name="calendar-date"
            family="ArgonExtra"
            size={18}
            color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
          />
        );  
      case "Getting Started":
        return <Icon />;
        default:
        return null;
    }
  };

  render() {
    const { focused, title, navigation } = this.props;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle, styles.shadow] : null
    ];

    return (
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            <Text
              size={18} style={{fontFamily:'regular'}}
              color={focused ? "white" : argonTheme.COLORS.GRADIENT_START}
            >
              {title}
            </Text>
          </Block>
        </Block>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomColor: argonTheme.COLORS.BLACKS,
    borderBottomWidth: 0.4,
    // marginLeft: -10,
    // marginRight: -10
  },
  activeStyle: {
    backgroundColor: argonTheme.COLORS.GRADIENT_START
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.1
  },
  LogOutButton: {
    justifyContent: 'flex-end',
    marginBottom: 5
  }
});

export default DrawerItem;
