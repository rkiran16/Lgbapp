import React from "react";
import {
  StyleSheet, Image
} from "react-native";
import { withNavigation } from 'react-navigation';
//galio
import { Block, Text, theme, Button } from "galio-framework";
import { Images, argonTheme, androidPhone, Util } from "../constants";

const { width } = Util;

class CatMenu extends React.Component {

  navigateTo = async(x) => {
    let arr = []
    if(!x) {
      return;
    }
    arr.push(x);
    const { push } = this.props
    await push(arr);
    return this.props.navigation.navigate("Categories", {headName:x.name, idToFind:x._id, routeKey:this.props.navigation.state.routeName});
  }

  renderOptions = (x) => {
    const { name, url } = x
    const icon = Images[url]
    const { optionLeft, location } = this.props;
    return(
      <Block style={{...styles.category}} key={x._id}>
        <Button shadowless style={[styles.categoryBtn, alignItems='center']} onPress={() => this.navigateTo(x)}>
          <Block column middle>
            <Block style={{...styles.avatarContainer}}>
              <Image
                source={ icon }
                style={styles.avatar}
              />
            </Block>
            <Text size={12} style={{...styles.tabTitle, fontWeight:'600', color:argonTheme.COLORS.GRADIENT_START}}>{optionLeft || name}</Text>
          </Block>
        </Button>
      </Block>
    );
  }

  list = (num) => {
    const { catData } = this.props;
    if (num === 4){
      return(
        catData.map((value, myIndex) => {
          if(myIndex < num+1) {
            return this.renderOptions(value);
          }
        })
      );
    } 
  }

  rowList = (num) => {
    const { catData } = this.props;
    if(num === 5) {
      num = num - 1;
      const newList = catData.slice(num);
      return newList.map(value => this.renderOptions(value));
    }
  }

  renderMenu = () => {
    const { optionLeft } = this.props;
    return(
      <Block flex column style={{width:width, height:160,}}>
        <Block flex row style={{ width:width}}>
          {this.list(4)}
        </Block>
        <Block flex row>
          {this.rowList(5)}
          <Block style={{...styles.category, borderTopWidth:0}}>
            <Button shadowless style={[styles.categoryBtn, alignItems='center']} onPress={() => this.props.navigation.navigate('CatOption')}> 
              <Block column middle>
                <Block center middle style={{...styles.avatarContainer, width: androidPhone ? 42 : 44, 
                  height: androidPhone ? 42 : 44, borderRadius: androidPhone ? 21 : 22, 
                  backgroundColor: '#e5e5e5'}}>
                  <Image
                    source={ Images.cat04 }
                    style={{width: androidPhone ? 23 : 25, height: androidPhone ? 23 : 25, borderRadius:0, }}
                  />
                </Block>
                <Text size={12} style={{...styles.tabTitle, fontWeight:'600', color:argonTheme.COLORS.GRADIENT_START}}>{optionLeft || 'View All'}</Text>
              </Block>
            </Button>                                                     
          </Block>                
      </Block>
    </Block>
    );
  }
  render() {
    return (
      <Block style={{...styles.container, alignItems:'center'}}>
        {this.renderMenu()}
      </Block>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  category: {
    //backgroundColor: argonTheme.COLORS.WHITE,
    //borderWidth: 0.7,
    //borderColor: '#efefef',
    minHeight: 10,
    width: width/4,
  },
  avatarContainer: {
    marginTop: androidPhone ? 40 : 38,
  },
  categoryBtn: {
    backgroundColor: androidPhone ? 'transparent' : 'transparent',
    borderRadius: 0,
    borderWidth: androidPhone ? null : 0,
    elevation: androidPhone ? 0 : 0,
    width: (width - theme.SIZES.BASE * 2)/4
  },
  avatar: {
    width: androidPhone ? 38 : 40,
    height: androidPhone ? 38 : 40,
    borderWidth: 0,
    alignSelf: 'center'
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '400',
    color: argonTheme.COLORS.HEADER,
    fontFamily: 'regular'
  },
  textFont: {
    fontFamily: 'regular'
  },
})

export default withNavigation(CatMenu);